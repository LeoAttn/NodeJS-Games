var express = require('express');
var router = express.Router();
var room = require('../controllers/Rooms');

/* GET home page. */
//router.get('/', function (req, res, next) {
//    res.render('index', {title: 'Bataille Navale', room: room});
//});
router.get('/', room.index);//Affiche la liste des rooms

router.post('/create', room.create);//Crée une room,
router.post('/join', room.joinLobby);//Rejoins une room via un boutton(form),
router.get('/join', room.joinLobby);//Rejoins une room via un lien
router.get('/lobby', room.lobby);

router.put('/lobby/set-ready/:id', room.setReady);

module.exports = router;
