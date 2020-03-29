require('rootpath')();
const express = require('express');
const app = express();
const cors = require('cors');
const bodyParser = require('body-parser');
const errorHandler = require('_helpers/error-handler');
const upload = require('_helpers/upload');
const http = require('http').createServer(app);
const env = 'development';
const config = require('./config')[env];
const clientURL = config.clientURL;
const sio = require("socket.io");
const io = sio.listen(http, {
    handlePreflightRequest: (req, res) => {
        const headers = {
            "Access-Control-Allow-Headers": "Content-Type, Authorization",
            "Access-Control-Allow-Origin": req.headers.origin, 
            //or the specific origin you want to give access to,
            "Access-Control-Allow-Credentials": true
        };
        res.writeHead(200, headers);
        res.end();
    }
});

//io.on("connection", () => {
//    console.log("Connected!");
//});
//io.origins(clientURL);
io.on('connection', (socket) => {
    console.log("Connected!");
    socket.on('pinLocation', (data) => {
        console.log("server socket.on Pinned!");
        console.log(data);
        if(data.location && data.room){
            console.log("server socket.on Pinned! with room "+data.room)
            socket.broadcast.to(data.room).emit('partnerLocation', {location: data.location});
        }
    });
    socket.on('room', function(room){     // take room variable from client side
        console.log("server socket.on join room "+room);
        socket.join(room) // and join it
        io.sockets.in(room).emit('message', {      // Emits a status message to the connect room when a socket client is connected
            type: 'status',
            text: 'Is now connected',
            created: Date.now(),
            //username: socket.request.user.username
        });
    });
});

app.io = io;

console.log("allowing connection from "+clientURL);

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cors());

// use JWT auth to secure the api
//app.use(jwt());

// api routes
app.use('/users', require('./users/users.controller'));
app.use('/houses', require('./houses/houses.controller'));
//app.use('/bundles', require('./bundles/bundles.controller'));

app.use('/echo', require('./_helpers/post-handler'))
// global error handler
app.use(errorHandler);

app.use(express.static('public'))

//https://scotch.io/tutorials/express-file-uploads-with-multer
//https://code.tutsplus.com/tutorials/file-upload-with-multer-in-node--cms-32088
app.post('/uploads', upload.single('image'), async (req, res) => {
    const file = req.file
    if (!file) {
        const error = new Error('Please upload a file')
        error.httpStatusCode = 400
        return next(error)
    }
    res.send(file)
})

// start server
const port = process.env.NODE_ENV === 'production' ? (process.env.PORT || 80) : 4000;
//https://stackoverflow.com/questions/46376277/
//vue-socket-io-connection-attempt-returning-no-access-control-allow-origin-hea
const server = http.listen(port, function () {
    console.log('Server listening on port ' + port);
});


