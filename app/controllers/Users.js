require('../models/User');
var mongoose = require("mongoose"),
    User = mongoose.model('User'),
    formidable = require('formidable'),
    path = require('path'),
    fs = require('fs');


var Users = {

    index: function (req, res) {//Get Request
        User.find({}, function (err, users) {
            if (err) throw err;
        });
    },
    sign_in: function (req, res) {//POST Request
        User.findOne({pseudo: req.body.pseudo}, function (err, user) {
            if (err) throw (err);
            if (user) {
                user.comparePassword(req.body.password, function (err, isMatch) {
                    if (isMatch) {
                        req.session.isAuthenticated = true;
                        req.session.username = user.pseudo;
                        req.session.avatarLink = user.avatarLink;
                        res.redirect('/');
                    } else {
                        res.redirect('/sign-in?error=nouser');
                    }
                });
            }
            else {
                res.redirect('/sign-in?error=nouser');
            }
        });
    },
    sign_out: function (req, res) {
        delete req.session.isAuthenticated;
        delete req.session.username;
        delete req.session.avatarLink;
    },
    account: function (req, res) {
        console.log(req.params.username);
        console.log(JSON.stringify(req.session));
        if (req.session.isAuthenticated == true) {
            User.findOne({pseudo: req.params.username}, "email last_name first_name pseudo avatarLink wins", function (err, userData) {
                if (err) throw err;
                if (userData) {
                    if (req.query.edit && req.session.username == req.params.username) {
                        res.render('edit-account', {
                            title: "Bataille Navale - Edition du profil",
                            active: 'Mon Compte',
                            session: req.session,
                            user: userData
                        })
                    }
                    else {
                        res.render('account', {
                            title: "Bataille Navale - Profil " + userData.pseudo,
                            active: 'Mon Compte',
                            session: req.session,
                            user: userData
                        });
                    }
                }
                else {
                    res.status(404).send('No content !');
                    res.end();
                }
            });
        }
        else {
            res.redirect('/sign-in');
        }
    },
    create: function (req, res) {//Post Request
        console.log(JSON.stringify(req.body));
        User.findOne({$or: [{'pseudo': req.body.pseudo}, {'email': req.body.email}]}, function (err, user) {
            if (!user) {
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
                req.session.avatarLink = u.avatarLink;
                res.redirect('/user/account/' + u.pseudo);
            }
            else
                res.redirect('/sign-up?error=exist');


        });
    },
    update: function (req, res) {//POST Request
        console.log("UPDATE USER FUnCt !");
        User.findOne({pseudo: req.session.username}, function (err, user) {
            if (err) throw err;
            if (user) {
                console.log("USER EXIST");
                var form = new formidable.IncomingForm();
                console.log("FORM var assigned");
                form.parse(req, function (err, fields, files) {
                    console.log("Fields : " + JSON.stringify(fields));
                    console.log("Files : " + JSON.stringify(files));
                    if (err) throw err;
                    if (files.avatar.size > 0) {
                        var old_path = files.avatar.path,
                            file_size = files.avatar.size,
                            file_ext = files.avatar.name.split('.').pop(),
                            index = old_path.lastIndexOf('\\') + 1,
                            file_name = old_path.substr(index),
                            new_path = '/uploads/avatars/' + file_name + '.' + file_ext;
                        fs.readFile(old_path, function (err, data) {
                            fs.writeFile(new_path, data, function (err) {
                                fs.unlink(old_path, function (err) {
                                    if (err) {
                                        res.status(500);
                                        res.json({'success': false});
                                    }
                                });
                            });
                        });
                    }
                    var last_name = user.last_name;
                    var first_name = user.first_name;
                    var pseudo = user.pseudo;
                    var email = user.email;
                    var avatarLink = user.avatarLink;
                    if (fields.last_name != "")
                        user.last_name = fields.last_name;
                    if (fields.first_name != "")
                        user.first_name = fields.first_name;
                    if (fields.pseudo != "")
                        user.pseudo = fields.pseudo;
                    if (fields.email != "")
                        user.email = fields.email;
                    if (files.avatar.size > 0)
                        user.avatarLink = new_path;
                    user.save();
                    res.redirect("/user/account/" + req.session.username);
                });
            }
            else {
                res.status(204).send('No content !');
                res.end();
            }
        });
    },
    delete: function (req, res) {//Post Request
        User.findOne({pseudo: req.session.username}, function (err, user) {
            if (err)throw err;
            if (user) {
                delete req.session.isAuthenticated;
                delete req.session.roomID;
                delete req.session.username;
                delete req.session.playerID;
                console.log("USER REMOVED");
                user.remove();
                res.redirect('/');
            }
            else {
                res.status(204).send('No content !');
                res.end();
            }
        });
    },
    addWin: function (username) {
        User.findOne({pseudo: username}, "wins", function (err, user) {
            if (err) throw err;
            user.wins += 1;
            user.save();
        })
    }
};

module.exports = Users;