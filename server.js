require('rootpath')();
const express = require('express');
const app = express();
const cors = require('cors');
const bodyParser = require('body-parser');
const errorHandler = require('_helpers/error-handler');
const upload = require('_helpers/upload');

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
const server = app.listen(port, function () {
    console.log('Server listening on port ' + port);
});
