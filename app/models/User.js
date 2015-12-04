var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var schema = new Schema({
    first_name: {type: String, required: false, default: ''},
    last_name: {type: String, required: false, default: ''},
    pseudo: {type: String, required: true},
    email: {type: String, required: true},
    password: {type: String, required: true},
    createdOn: {type: Date, default: Date.now}
});

exports.model = mongoose.model('User', schema, 'users');
