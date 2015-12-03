var express = require('express');
var router = express.Router();
var room = require('../controllers/Rooms');

/* GET home page. */
//router.get('/', function (req, res, next) {
//    res.render('index', {title: 'Bataille Navale', room: room});
//});
router.get('/', room.index);

router.post('/create', room.create);
router.post('/join', room.join);
router.get('/join', room.joinLink);

module.exports = router;
