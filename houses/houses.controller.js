const express = require('express');
const router = express.Router();
const houseService = require('./house.service');
const path = require('path');
const fs = require('fs');
const fileHelper = require('../_helpers/file-helper');
const jwt = require('../_helpers/jwt');
const sharp = require('sharp');
const upload = require('../_helpers/upload');


// routes
//router.get('/', getAll);
router.get('/:id',jwt(), getById);
router.get('/:username/:name', jwt(), getByUserAndName);
router.put('/:id', jwt(), update);
//router.post('/updateBg', jwt(), upload.single('bg'), updateBg);
//router.put('/:username/:name', jwt(), getByUserAndName);
router.delete('/:id', jwt(), _delete);

module.exports = router;


function getAll(req, res, next) {
    houseService.getAll()
        .then(houses => res.json(houses))
        .catch(err => next(err));
}

function getById(req, res, next) {
    //console.log(req.params);
        houseService.getById(req.params.idOrName)
        .then(house => {
            if(house){
                res.json(house) 
            } else{ 
                res.sendStatus(404) 
            } 
        })
        .catch(err => next(err));
}

function getByUserAndName(req, res, next){
    houseService.getByUserAndName(req.params.username, req.params.name)
        .then(house => {
            if(house){
                res.json(house) 
            } else{ 
                res.sendStatus(404) 
            } 
        })
        .catch(err => next(err));
}

function update(req, res, next) {
    houseService.update(req.params.id, req.body)
        .then(() => res.json({}))
        .catch(err => next(err));
}

function updateBg(req, res, next) {
    //const img = fs.readFileSync(req.file.path);
    //console.log(req.file.path);
    houseService.getOwnerOf(req.body.id).then(username=>{
         if(username){
            const newRelPath = '/'+ path.join(username, path.parse(req.file.path).base);
            const newAbsPath = path.join(req.file.path, "../../public", newRelPath);
            fs.promises.mkdir(path.dirname(newAbsPath), {recursive: true})
            .then(()=>{
                fileHelper.moveFile(req.file.path, newAbsPath);
                houseService.update(req.body.id, {bg: newRelPath});
                res.json({path: newRelPath.replace(/\\/g, '/')});
            })
        }
    }).catch( err => {
        next(err);
    });
   
    /*---------------------------------------------------------------
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
                fileHelper.unlinkFile(req.file.path).catch(err => next(err));
                res.json({url: req.file.path, base64: finalImg})
            })
            .catch(err => next(err));
    }).catch( err => {
        next(err);
    });*/
}

function _delete(req, res, next) {
    houseService.delete(req.params.id)
        .then(() => res.json({}))
        .catch(err => next(err));
}

