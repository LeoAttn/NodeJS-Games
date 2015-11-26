var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var schema = new Schema({
    creator: {type: Schema.ObjectId, required: true},
    player2: {type: Schema.ObjectId, required: false},
    //board1: {type:[[],[],[],[],[],[],[],[],[],[]], required: false},
    //board2: {type:[[],[],[],[],[],[],[],[],[],[]], required: false},
    playing: {type: Boolean, default: false},
    private: {type: Boolean, required: true},
    createdOn: {type: Date, default: Date.now}
});

exports.model = mongoose.model('Room', schema, 'Rooms');
