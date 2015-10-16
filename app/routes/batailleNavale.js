var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
    res.render('batailleNavale/index', { title: 'NodeJS-Games - Bataille Navale' });
});

module.exports = router;
