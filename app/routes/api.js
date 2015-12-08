var express = require('express');
var router = express.Router();
var room = require('../controllers/Rooms');

/* GET home page. */
//router.get('/', function (req, res, next) {
//    res.render('index', {title: 'Bataille Navale', room: room});
//});
router.get('/', room.apiIndex);//Affiche la liste des room
router.put('/lobby/set-ready/:id', room.apiUpdateReady);

module.exports = router;
