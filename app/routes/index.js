var express = require('express');
var router = express.Router();
var room = require('../controllers/Rooms');
var user = require('../controllers/Users');

/**===========================
        INDEX ROUTES
===========================**/
router.get('/', room.index);//Affiche la liste des room
router.post('/create', room.create);//Crée une room,
router.post('/join', room.joinLobby);//Rejoins une room via un boutton(form),
router.get('/join/:id', room.joinLobby);//Rejoins une room via un lien
router.get('/lobby/:id', room.lobby);//Affiche la vue du lobby
router.get('/flush-session', function(req, res){
    delete req.session.roomID;
    delete req.session.playerID;
    res.redirect('/');
});//Vide la session
/**===========================
        AUTH ROUTES
===========================**/
router.get('/sign-in', function(req, res){
    if(req.session.isAuthenticated)
    {
        res.redirect('/user/account/' + req.session.username);
    }
    else
    {
        res.render('connexion', {title : "Connexion", active: 'Connexion', session : req.session});
    }
});//Affiche la vue de connexion
router.post('/sign-in', user.sign_in);//Connecte l'utilisateur
router.get('/sign-up', function (req, res){
    if(req.session.isAuthenticated)
    {
        res.redirect('/user/account/' + req.session.username);
    }
    else
    {
        res.render('inscription', {title : "S'inscription", active: 'S\'inscrire', session : req.session});
    }
});//Affiche la vue de l'inscription
router.post('/sign-out', user.sign_out);//Deconnecte l'utilisateur

module.exports = router;
