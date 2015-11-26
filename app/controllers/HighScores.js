require('../models/Highscore');

var mongoose = require("mongoose"),
    Highscore = mongoose.model('User');


var Highscores = {

    index: function (req, res) {
        Highscore.find({}, function (err, users) {

        });

    },
    create: function (req, res) {
        var h = new Highscore({
            pseudo: req.body.pseudo,
            score: req.body.score
        });
    }

};