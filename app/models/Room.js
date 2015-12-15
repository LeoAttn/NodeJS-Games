var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var schema = new Schema({
    name: {type: String, required: true},
    creator: {type: String, required: true},
    player2: {type: String, required: false},
    playing: {type: Boolean, default: false},
    ready : {type : Boolean, default: false},
    private: {type: Boolean, required: true},
    createdOn: {type: Date, default: Date.now}
});

exports.model = mongoose.model('Room', schema);
