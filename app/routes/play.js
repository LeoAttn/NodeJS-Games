var express = require('express');
var router = express.Router();

router.get('/', function (req, res, next) {
    res.render('play', {title: 'Bataille Navale - En cours'});
});

router.get('/', function (req, res, next) {
    res.render('play', {title: 'Bataille Navale - En cours'});
});

module.exports = router;
