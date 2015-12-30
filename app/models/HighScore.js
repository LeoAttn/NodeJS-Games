var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var schema = new Schema({
    owner: {type: String, required: true},
    nbLap: {type: Number, required: true},
    time: {type: Number, required: true},
    createdOn: {type: String, required: true}
});

exports.model = mongoose.model('Highscore', schema, 'Highscores');