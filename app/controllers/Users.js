require('../models/User');
var mongoose = require("mongoose"),
    User = mongoose.model('User'),
    formidable = require('formidable'),
    path = require('path'),
    fs = require('fs.extra');



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
        res.redirect('/');
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
        User.findOne({$or: [{'pseudo': req.body.pseudo}, {'email': req.body.email}]}, function (err, user) {
            if (!user) {
                if (req.body.password == req.body.confirmPass) {
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
                } else
                    res.redirect('/sign-up?error=pwdDifferent');
            } else
                res.redirect('/sign-up?error=exist');
        });
    },
    update: function (req, res) {//POST Request
        User.findOne({pseudo: req.session.username}, function (err, user) {
            if (err) throw err;
            if (user) {
                var form = new formidable.IncomingForm();
				//form.uploadDir = "/images/upload/avatars/";
				form.parse(req, function (err, fields, files){
                    if (fields.last_name != "")
						user.last_name = fields.last_name;
					if (fields.first_name != "")
						user.first_name = fields.first_name;
					if (fields.pseudo != "")
						user.pseudo = fields.pseudo;
					if (fields.email != "")
						user.email = fields.email;
                });

				form.on('progress', function(bytesReceived, bytesExpected) {
					var percent_complete = (bytesReceived / bytesExpected) * 100;
					console.log(percent_complete.toFixed(2));
				});
				form.on('end', function (fields, files) {
					/* Temporary location of our uploaded file */
					var temp_path = this.openedFiles[0].path;
					/* The file name of the uploaded file */
					var file_name = this.openedFiles[0].name;
					/* Location where we want to copy the uploaded file */
					var new_location = path.join(path.dirname('../app'), 'public/images/uploads/');
					fs.copy(temp_path, new_location + file_name, function (err) {
						if (err) {
							console.error(err);
						} else {
							console.log("success!")
						}
					});

					if (this.openedFiles[0].size > 0)
						user.avatarLink = "/images/uploads/"+file_name;
					user.save();
				});
                    /*console.log("Files : " + JSON.stringify(files));
                    if (err) throw err;
                    if (files.avatar.size > 0) {
                        var old_path = files.avatar.path,
                            file_size = files.avatar.size,
                            file_ext = files.avatar.name.split('.').pop(),
                            new_path = '/images/uploads/avatars/' + files.avatar.name;
                        fs.readFile(old_path, function (err, data) {
                            fs.writeFile(new_path, data, function (err) {
								console.log(data);
                                fs.unlink(old_path, function (err) {
                                    if (err) {
                                        res.status(500);
                                        res.json({'success': false});
                                    }
                                });
                            });
                        });
                    }
				*/
				res.redirect("/user/account/" + req.session.username);
                //});
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
