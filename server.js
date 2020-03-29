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
    socket.on('ping', (data) => {
        console.log("Pinged!")
        socket.emit('newLocation', data);
    });
    socket.on('stupid', (data) => {
        console.log("Stupid Pinged!")
        socket.broadcast.emit('newLocation', {bla:'bka'});
        socket.broadcast.to(data).emit('newLocation', {bla:'I just met you'});
    });
});

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


