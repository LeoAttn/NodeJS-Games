require('../models/User');

var mongoose = require("mongoose"),
    User = mongoose.model('User');


var Users = {

    index: function (req, res) {//Get Request
        User.find({}, function (err, users) {
            if (err) throw err;
        });
    },
    sign_in : function(req, res){//POST Request
        User.findOne({pseudo : req.body.pseudo, password : req.body.password}, function (err, user){
            if(err) throw (err)
            if(user){
                req.session.isAuthenticated = true;
                req.session.username = user.pseudo;
                req.session.avatarLink = user.avatarLink;
                res.redirect('/user/account?username='+ user.pseudo);
            }
            else{
                res.redirect('/sign-in?error=nouser');
            }
        });
    },
    sign_out : function(req, res){
        delete req.session.isAuthenticated;
        delete req.session.username;
        delete req.session.avatarLink;
    },
    account : function (req, res){
        console.log(req.query.username);
        console.log(JSON.stringify(req.session));
        if(req.session.isAuthenticated == true){
            User.findOne({pseudo: req.query.username}, "email last_name first_name pseudo avatarLink wins", function(err, userData){
            if(err) throw err;
            if(userData)
            {
                if(req.query.edit && req.session.username == req.query.username){
                    res.render('edit-account',{title : "Edition du profil", session: req.session, user : userData})
                }
                else{
                    res.render('account', {title : "Profil " + userData.pseudo, session : req.session, user : userData});
                }
            }
            else
            {
                res.status(404).send('No content !');
                res.end();
            }
        });
        }
        else{
            res.redirect('/sign-in');
        }
    },
    create: function (req, res) {//Post Request
        console.log(JSON.stringify(req.body));
        User.findOne({pseudo : req.body.pseudo}, function(err, user){
            if(!user)
            {
                var u = new User({
                    pseudo: req.body.pseudo,
                    password: req.body.password,
                    email: req.body.email,
                    avatarLink: "/images/default.png"
                });
                u.save(function (err) {
                    if (err) throw err;
                    console.log('User inserted');
                });
                req.session.isAuthenticated = true;
                req.session.username = u.pseudo;
                req.session.avatarLink
                res.redirect('/user/account?username=' + u.pseudo);
            }
            else
                res.redirect('/sign-in?error=exist');


        });
    },
    update : function (req, res){//POST Request
        User.findOne({pseudo : req.session.username}, function(err, user){
            if(err) throw err;
            if(user)
            {
                console.log(JSON.stringify(req.body));
                var last_name = user.last_name;
                var first_name = user.first_name;
                var pseudo = user.pseudo;
                var email = user.email;
                var avatarLink = user.avatarLink;
                if(req.body.last_name !== undefined)
                    user.last_name = req.body.last_name;
                if(req.body.first_name !== undefined)
                    user.first_name = req.body.first_name;
                if(req.body.pseudo !== undefined)
                    user.pseudo = req.body.pseudo;
                if(req.body.email !== undefined)
                    user.email = req.body.email;
                if(req.body.avatarLink !== undefined)
                    user.avatarLink = req.body.avatarLink;
                user.save();
                res.redirect("/user/account?username="+ req.session.username);
            }
            else
            {
                res.status(204).send('No content !');
                res.end();
            }
        });
    },
    delete : function (req, res){//Post Request
        User.findOne({pseudo : req.session.username}, function (err, user){
            if(err)throw err;
            if(user)
            {
                delete req.session.isAuthenticated;
                delete req.session.roomID;
                delete req.session.username;
                delete req.session.playerID;
                console.log("USER REMOVED");
                user.remove();
                res.redirect('/');
            }
            else
            {
                res.status(204).send('No content !');
                res.end();
            }
        });
    },
    addWin : function (username){
        User.findOne({pseudo : username}, "wins", function (err, user){
            if(err) throw err;
            user.wins +=1;
            user.save();
        })
    }
};

module.exports = Users;
