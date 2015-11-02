var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var schema = new Schema({
    owner: {type: String, required: true},
    score: {type: Int, required: true},
    createdOn: { type: Date, default: Date.now}
});

exports.model = mongoose.model('Highscore', schema, 'Highscores');