var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var schema = new Schema({
    creator: {type: String, required: true},
    name: {type: String, required: true},
    player2: {type: String, required: false},
    board1: {type: Array, required: false},
    board2: {type: Array, required: false},
    playing: {type: Boolean, default: false},
    ready : {type : Boolean, default: false},
    private: {type: Boolean, required: true},
    createdOn: {type: Date, default: Date.now},
    lastConnect: {type : Date, default:Date.now}
});

exports.model = mongoose.model('Room', schema);
