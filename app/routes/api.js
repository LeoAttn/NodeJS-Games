var express = require('express');
var router = express.Router();
var apiRoom = require('../controllers/ApiRooms');

/**====================================
            API ROUTES
=======================================**/
router.get('/', apiRoom.index);//Récupère la liste des rooms
router.put('/set-ready/:id', apiRoom.update);//Met à jour la room
router.delete('/delete/:id', apiRoom.delete);//Supprime la room

module.exports = router;
