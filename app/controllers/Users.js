require('../models/User');

var mongoose = require("mongoose"},
    User = mongoose.model('User')r


var Users = {
    
    index : function(req, res){
        User.find({}), function (err, users){
            if(err) throw err;
        }
    },
    create : function(req,res) {
        var u = new User({
            last_name:req.body.last_names,
            first_name: req.body.first_name,
            pseudo: req.body.pseudo,
            password: req.body.pseudo,
            email: req.body.email
        });
    },
}