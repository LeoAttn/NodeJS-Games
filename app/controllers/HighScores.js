require('../models/HighScore');

var mongoose = require("mongoose"),
    Highscore = mongoose.model('Highscore');


var Highscores = {

    index: function (req, res) {
        Highscore.find({}, function (err, highscores) {
            if (err) throw err;
            //res.json(rooms);
            res.render('highscores', {
                title: 'Bataille Navale -  Highscores',
                active: 'Highscores',
                session: req.session,
                scores: highscores
            });
        }).sort({_id:-1});
    },
    create: function (name, nbLap, time) {
        var t = new Date();
        var mois = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'];
        var date = t.getDate() + " " + mois[t.getMonth()] + "&nbsp; à &nbsp;" + t.getHours() + ":" + t.getMinutes();

        var h = new Highscore({
            owner: name,
            nbLap: nbLap,
            time: time,
            createdOn: date
        });
        h.save(function (err) {
            if (err) throw err;
            console.log('Score inserted');
        });
    }

};

module.exports = Highscores;