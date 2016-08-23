require('../models/Room');
require('../models/User');

var Users = require('./Users');

var mongoose = require("mongoose"),
    Room = mongoose.model('Room');
User = mongoose.model('User');


var Rooms = {
    index: function (req, res) {
        var msg;
        switch (req.query.error) {
            case 'full':
                msg = "La partie est pleine ! Désolé...";
                break;
            case 'noroom':
                msg = "Aucune room selectionnée !";
                break;
            case 'alreadyInGame':
                msg = "Vous avez déjà une partie en cours.";
                break;
            case 'notAllowed':
                msg = "Vous n'avez pas accès à cette room.";
                break;
            case 'OwnerQuit':
                msg = "Le créateur à quitté la room.";
                break;
            case 'improper':
                msg = "Ce pseudo/email n'est pas conforme !";
                break;
        }
        if (req.session.roomID) {
            Room.findOne({_id: req.session.roomID}, function (err, room) {
                if (err)throw err;
                if (!room) {
                    console.log("SESSION ROOMID DELETED");
                    delete req.session.roomID;
                    delete req.session.playerID;
                }
            });
        }

        Room.find({'private': false, 'playing': false}, "name creator createdOn", function (err, rooms) {
            if (err) throw err;
            //res.json(rooms);
            res.render('index', {
                title: 'Bataille Navale',
                rooms: rooms,
                message: msg
            });
        });
    },
    create: function (req, res, next) {
        if (!req.session.roomID) {
            var regexPseudo = /^[A-Za-z0-9_[\]-]+$/;
            var regexRoom = /^[A-Za-z0-9_[\]-]*$/;
            if (regexPseudo.test(req.body.username) && regexRoom.test(req.body.roomName)) {
                if (req.session.username === undefined || !req.session.isAuthenticated) {
                    if (req.body.username.length > 20)
                        req.body.username = req.body.username.substr(0, 20);
                    User.find({pseudo: req.body.username}, function (err, user) {
                        if (user) {
                            //res.redirect('/?error=pseudoExist');
                            console.log('EXIST');
                            return;
                        }
                    });
                    req.session.username = req.body.username;
                }
                if (!(req.body.roomName))
                    req.body.roomName = "room_" + (Math.round(Math.random() * 100000)).toString();
                else if (req.body.roomName.length > 20)
                    req.body.roomName = req.body.roomName.substr(0, 20);
                req.body.private = (req.body.private == "on");
                var t = new Date();
                var mois = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'];
                var date = t.getDate() + " " + mois[t.getMonth()] + "&nbsp; à &nbsp;" + t.getHours() + ":" + t.getMinutes();

                var r = new Room({
                    creator: req.session.username,
                    name: req.body.roomName,
                    private: req.body.private,
                    createdOn: date
                });
                console.log('date = ' + new Date());
                r.save(function (err) {
                    if (err) throw err;
                    console.log('Room inserted');
                });
                req.session.roomID = r._id;
                req.session.playerID = 'creator';
                res.redirect('/lobby/' + r._id);
            } else
                res.redirect('/?error=improper');
        }
        else
            res.redirect('/?error=alreadyInGame');
    },
    joinLobby: function (req, res) {
        var roomId = (req.params.id) ? req.params.id : req.body.id;
        if (req.session.roomID) {
            Room.findOne({_id: req.session.roomID}, function (err, room) {
                if (err)throw err;
                if (!room) {
                    console.log("SESSION ROOMID DELETED");
                    delete req.session.roomID;
                    delete req.session.playerID;
                }
            });
        }
        Room.findOne({_id: roomId}, function (err, room) {
            if (err) throw err;
            //res.json(room);
            if (!req.session.roomID) {
                if (room) {
                    if (room.player2 === undefined) {
                        if (req.session.isAuthenticated == false) {
                            req.session.username = "";
                            room.player2 = "Anonyme"
                        }
                        else
                            room.player2 = req.session.username;
                        req.session.roomID = room._id;

                        room.save(function (err) {
                            if (err) throw err;
                            console.log('User enter in Room');
                        });
                        req.session.playerID = 'player2';
                        res.redirect('/lobby/' + room._id);
                    }
                    else
                        res.redirect('/?error=full');
                }
                else
                    res.redirect('/?error=noroom');
            }
            else
                res.redirect('/?error=alreadyInGame');
        });
    },
    lobby: function (req, res) {
        if (req.session.roomID == req.params.id) {
            Room.findOne({_id: req.params.id}, function (err, room) {
                if (err) throw err;
                if (room) {
                    res.render('lobby', {
                        title: "Bataille Navale - Lobby: " + room.name,
                        noReturnParty: true,
                        tRoom: room
                    });
                }
                else
                    res.redirect('/?error=noroom');
            });
        }
        else {
            res.redirect('/?error=notAllowed')
        }
    },
    play: function (req, res) {
        Room.findOne({_id: req.params.id}, function (err, room) {
            if (err) throw err;
            if (room) {
                if (req.session.roomID == room._id) {
                    if (room.ready) {
                        room.playing = true;
                        req.session.roomID = room._id;
                        req.cookies.roomID = room._id;
                        res.render('play', {
                            title: "Battaille Navale - En cours: " + room.name,
                        });
                    }
                    else {
                        res.redirect('/lobby/' + room._id);
                    }
                }
                else if (room._id != req.session.roomID) {
                    res.redirect('/?error=alreadyInGame');
                }
                else if (room.playing == true) {
                    res.redirect('/?error=full');
                }
                else if (room.ready == false) {
                    res.redirect('/joinLink');
                }

            } else {
                res.redirect('/?error=noroom');
            }
        });
    },
    delete: function (id) {
        Room.findOne({_id: id}, function (err, room) {
            if (err) throw err;
            if (room) {
                if (!room.ready || room.playing) {
                    console.log("ROOM DELETED");
                    room.remove();
                }
            }
        });
    }
};

module.exports = Rooms;
