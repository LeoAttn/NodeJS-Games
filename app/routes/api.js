var express = require('express');
var router = express.Router();
var apiRoom = require('../controllers/ApiRooms');

/* GET home page. */
//router.get('/', function (req, res, next) {
//    res.render('index', {title: 'Bataille Navale', room: room});
//});
router.get('/', apiRoom.index);//Récupère la liste des room
router.put('/set-ready/:id', apiRoom.update);
router.delete('/delete/:id', apiRoom.delete);

module.exports = router;
