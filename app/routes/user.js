var express = require('express');
var router = express.Router();
var users = require('../controllers/Users');


router.get('/account', users.account);
router.post('/create', users.create);
router.post('/update', users.update);
router.post('/delete', users.delete);


module.exports = router;
