const express = require('express');
const router = express.Router();

router.post('/', echoAll);

module.exports = router;

function echoAll(req, res, next) {
    res.json(req.body);
}