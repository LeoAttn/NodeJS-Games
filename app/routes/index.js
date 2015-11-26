var express = require('express');
var router = express.Router();
var room = require('../controllers/Rooms');

/* GET home page. */
router.get('/', function (req, res, next) {
    res.render('index', {title: 'Bataille Navale'});
});

router.get('/create', room.create);
router.get('/join', room.join);

module.exports = router;
