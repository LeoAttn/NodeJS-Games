var express = require('express');
var router = express.Router();
var room = require('../controllers/Rooms');

/* GET home page. */
//router.get('/', function (req, res, next) {
//    res.render('index', {title: 'Bataille Navale', room: room});
//});
router.get('/', room.index);//Affiche la liste des room
router.post('/create', room.create);//Crée une room,
router.post('/join', room.joinLobby);//Rejoins une room via un boutton(form),
router.get('/join', room.joinLobby);//Rejoins une room via un lien
router.get('/lobby', room.lobby);
router.get('flush-session', function(req, res){

    delete req.session.roomID;
    delete req.session.playerID;
    res.redirect('/');
})

module.exports = router;
