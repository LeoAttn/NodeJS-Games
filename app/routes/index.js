var express = require('express');
var router = express.Router();
var room = require('../controllers/Rooms');
var user = require('../controllers/Users');

/* GET home page. */
//router.get('/', function (req, res, next) {
//    res.render('index', {title: 'Bataille Navale', room: room});
//});
router.get('/', room.index);//Affiche la liste des room
router.post('/create', room.create);//Crée une room,
router.post('/join', room.joinLobby);//Rejoins une room via un boutton(form),
router.get('/join', room.joinLobby);//Rejoins une room via un lien
router.get('/lobby', room.lobby);

router.get('/sign-in', function(req, res){
    if(req.session.isAuthenticated)
    {
        res.redirect('/user/account?username=' + req.session.username);
    }
    else
    {
        res.render('connexion', {title : "Connexion", session : req.session});
    }
});
router.post('/sign-in', user.sign_in);
router.get('/sign-up', function (req, res){
    if(req.session.isAuthenticated)
    {
        res.redirect('/user/account?username=' + req.session.username);
    }
    else
    {
        res.render('inscription', {title : "S'inscription", session : req.session});
    }
});
router.get('/sign-out', function(req, res){
    if(!req.session.isAuthenticated)
    {
        res.redirect('/');
    }
    else
    {
        delete req.session.isAuthenticated;
        delete req.session.username;
        res.redirect('/');
    }
});
router.post('/sign-out', user.sign_out);

router.get('/flush-session', function(req, res){
    delete req.session.roomID;
    delete req.session.playerID;
    res.redirect('/');
});

module.exports = router;
