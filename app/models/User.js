var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    bcrypt = require('bcrypt-nodejs'),
    SALT = 10;

var schema = new Schema({
    first_name: {type: String, required: false, default: ''},
    last_name: {type: String, required: false, default: ''},
    pseudo: {type: String, required: true},
    email: {type: String, required: true},
    password: {type: String, required: true},
    avatarLink: {type: String, required: false},
    wins: {type: Number, default: 0},
    createdOn: {type: Date, default: Date.now}
});

//Appelé avant d'effectuer la sauvegarde d'un utilisateur
schema.pre('save', function (next) {
    var user = this;
    // si le mot de passe est modifié ou crée
    if (!user.isModified('password')) return next();
    bcrypt.genSalt(SALT, function (err, salt) {
        if (err) return next(err);
        bcrypt.hash(user.password, salt, null, function (err, hash) {
            if (err) return next(err);
            user.password = hash;
            next();
        });
    });
});

schema.methods.comparePassword = function (candidatePassword, cb) {
    bcrypt.compare(candidatePassword, this.password, function (err, isMatch) {
        if (err) return cb(err);
        cb(null, isMatch);
    });
};


exports.model = mongoose.model('User', schema, 'Users');