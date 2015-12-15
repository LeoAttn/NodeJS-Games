var express = require('express'),
    router = express.Router(),
    room = require('../controllers/Rooms');

/**================================
        ROUTES PARTIES
===================================**/
router.get('/:id', room.play);

module.exports = router;
