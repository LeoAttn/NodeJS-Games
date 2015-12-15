var express = require('express');
var router = express.Router();
var room = require('../controllers/Rooms');


router.get('/:id', room.play);

module.exports = router;
