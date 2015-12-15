var express = require('express'),
    router = express.Router(),
    users = require('../controllers/Users');

/**================================
        USERS ROUTES
 ===================================**/
router.get('/account/:username', users.account);//Affiche la vue du compte utilisateur
router.post('/create', users.create);//Créer l'utilisateur
router.post('/update', users.update);//Met à jour l'utilisateur'
router.post('/delete', users.delete);//Supprime l'utilisateur


module.exports = router;