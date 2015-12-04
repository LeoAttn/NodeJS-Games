var express = require('express');
var router = express.Router();
var room = require('../controllers/Rooms');


router.get('/', room.play);

module.exports = router;
