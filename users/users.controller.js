const express = require('express');
const router = express.Router();
const userService = require('./user.service');
const path = require('path');
const fs = require('fs');
const fileHelper = require('../_helpers/file-helper');
const jwt = require('../_helpers/jwt');
const sharp = require('sharp');
const upload = require('../_helpers/upload');


// routes
router.post('/authenticate', authenticate);
router.post('/register', register);
//router.get('/', getAll);
router.get('/:idOrName', jwt(), getByIdOrName);
router.get('/pin/:username/:pin', jwt(), getByNameAndPin);
router.put('/:id', jwt(), update);
router.delete('/:id', jwt(), _delete);
router.post('/uploadAvatar', jwt(), upload.single('avatar'), updateAvatar);
router.post('/getMyHouses', jwt(), getMyHouses);
router.post('/addHouse', jwt(), addHouse);
router.post('/deleteHouse', jwt(), deleteHouse);
router.post('/setPrimary', jwt(), setPrimary);
router.get('/getPrimary/:username', jwt(), getPrimary);
router.post('/initMatch', jwt(), initMatch);
router.post('/terminateExistingMatch', jwt(), terminateExistingMatch);
router.post('/acceptRequest', jwt(), acceptRequest);
router.post('/declineRequest', jwt(), declineRequest);
//router.post('/addBundle', jwt(), addBundle);
//router.post('/deleteBundle', jwt(), deleteBundle);


module.exports = router;

function authenticate(req, res, next) {
    userService.authenticate(req.body)
        .then(user => user ? res.json(user) : res.status(400).json({ message: 'Username or password is incorrect' }))
        .catch(err => next(err));
}

function register(req, res, next) {
    userService.create(req.body)
        .then(() => res.json({}))
        .catch(err => next(err));
}

//function getAll(req, res, next) {
//    userService.getAll()
//        .then(users => res.json(users))
//        .catch(err => next(err));
//}

function getCurrent(req, res, next) {
    userService.getById(req.user.sub)
        .then(user => user ? res.json(user) : res.sendStatus(404))
        .catch(err => next(err));
}

function getByIdOrName(req, res, next) {
    //console.log(req.params);
        userService.getById(req.params.idOrName)
        .then(user => {
            if(user){
                res.json(user) 
            } else{
                userService.getByName(req.params.idOrName)
                .then(user => {
                    if(user){
                        res.json(user) 
                    } else{
                        res.sendStatus(404)
                    } 
                })
            } 
        })
        .catch(err => next(err));
}

function getByNameAndPin(req, res, next) {
    //console.log(req.params);
        userService.getByNameAndPin(req.params.username, req.params.pin)
        .then(user => {
                if(user){
                    res.json(user);       
                } else{
                    res.sendStatus(404)
                } 
            } 
        )
        .catch(err => next(err));
}

function update(req, res, next) {
    userService.update(req.params.id, req.body)
        .then((user) => res.json(user))
        .catch(err => next(err));
}

function updateAvatar(req, res, next) {
    fs.readFile(req.file.path, function (err, img) {
        if (err) {
            next(err);
        }else{
            sharp(img)
            .resize(200, 200, {
                fit: 'contain',
                background: { r: 255, g: 255, b: 255, alpha: 0.5 }
            })
            .toBuffer()
            .then(function(outputBuffer) {
                // outputBuffer contains JPEG image data
                //
                //console.log(outputBuffer);
                var encode_image = outputBuffer.toString('base64');
                var mimeType = path.extname(req.file.path).substr(1);
                // Define a JSONobject for the image attributes for saving to database
                
                var finalImg = 'data:' + mimeType + ';base64,' + encode_image;
                userService.update(req.body.id, {avatar:finalImg})
                    .then(() => {
                        fileHelper.unlinkFile(req.file.path).catch(err => console.log(err));
                        res.json({url: req.file.path, base64: finalImg})
                    })
                    .catch(err => next(err));
            }).catch( err => {
                next(err);
            });    
        }
    });

}

function addHouse(req, res, next){
    userService.addHouse(req.body.id, req.body.house)
    .then((user) => {
        res.json(user.houses)
    })
    .catch(err => next(err));
}

function deleteHouse(req, res, next){
    userService.deleteHouse(req.body.houseId)
    .then((user) => {
        res.json(user.houses)
    })
    .catch(err => next(err));
}

function setPrimary(req, res, next){
    userService.setPrimary(req.body.userId, req.body.houseId)
    .then((user) => {
        res.json(user.houses)
    })
    .catch(err => next(err));
}

function getPrimary(req, res, next){
    userService.getPrimary(req.params.username)
        .then(house => {
            if(house){
                res.json(house) 
            } else{ 
                res.sendStatus(404) 
            } 
        })
        .catch(err => next(err));
}

function getMyHouses(req, res, next){
    userService.getMyHouses(req.body.id)
    .then((user) => {
        res.json(user.houses)
    })
    .catch(err => next(err));
}

function initMatch(req, res, next){
    userService.initMatch(req.body.id, req.body.BName, req.body.BPin)
    .then((user) => {
        res.json(user)
    })
    .catch(err => next(err));
}

function terminateExistingMatch(req, res, next){
    userService.terminateExistingMatch(req.body.id)
    .then((user) => {
        res.json(user)
    })
    .catch(err => next(err));
}

function acceptRequest(req, res, next){
    userService.acceptRequest(req.body.id)
    .then((user) => {
        res.json(user)
    })
    .catch(err => next(err));
}

function declineRequest(req, res, next){
    userService.declineRequest(req.body.id)
    .then((user) => {
        res.json(user)
    })
    .catch(err => next(err));
}

function _delete(req, res, next) {
    userService.delete(req.params.id)
        .then(() => res.json({}))
        .catch(err => next(err));
}

