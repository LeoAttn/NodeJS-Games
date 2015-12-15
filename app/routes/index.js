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
router.get('/highscores', function (req, res) {
    res.render('highscores', {
        title: 'Bataille Navale - Highscores',
        active: 'Highscores',
        session: req.session
    });
});
router.get('/flush-session', function (req, res) {
    delete req.session.roomID;
    delete req.session.playerID;
    res.redirect('/');
});//Vide la session
/**===========================
        AUTH ROUTES
 ===========================**/
router.get('/sign-in', function (req, res) {
    if (req.session.isAuthenticated) {
        res.redirect('/user/account/' + req.session.username);
    }
    else {
        switch (req.query.error) {
            case 'nouser':
                var msg = "Le pseudo ou le mot de passe est incorrect !";
                break;
        }
        res.render('connexion', {
            title: "Bataille Navale - Connexion",
            active: 'Connexion',
            session: req.session,
            message: msg
        });
    }
});//Affiche la vue de connexion
router.post('/sign-in', user.sign_in);//Connecte l'utilisateur
router.get('/sign-up', function (req, res) {
    if (req.session.isAuthenticated) {
        res.redirect('/user/account/' + req.session.username);
    }
    else {
        switch (req.query.error) {
            case 'pwdDifferent':
                var msg = "Les deux mots de passe sont différents !";
                break;
            case 'exist':
                var msg = "Ce pseudo/email est déjà pris !";
                break;
        }
        res.render('inscription', {
            title: "Bataille Navale - Inscription",
            active: 'S\'inscrire',
            session: req.session,
            message: msg
        });
    }
});//Affiche la vue de l'inscription
router.get('/sign-out', user.sign_out);//Deconnecte l'utilisateur

module.exports = router;