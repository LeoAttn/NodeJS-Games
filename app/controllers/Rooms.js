require('../models/Room');

var Users = require('./Users');

var mongoose = require("mongoose"),
    Room = mongoose.model('Room');


var Rooms = {
    index: function (req, res) {
        if (req.query.error == "full")
            var msg = "La partie est pleine ! Désolé...";
        if (req.query.error == "noroom")
            var msg = "Aucune room selectionnée !";
        if (req.query.error == "alreadyInGame")
            var msg = "Vous avez déjà une partie en cours";

        Room.find({}, function (err, rooms) {
            if (err) throw err;
            //res.json(rooms);
            res.render('index', {title: 'Bataille Navale', session : req.session, room: rooms, message: msg});
        });
    },
    create: function (req, res) {
        if(!req.session.roomID)
        {
            req.session.username = req.body.username;
            if (!(req.body.roomName))
                req.body.roomName = "room_" + (Math.round(Math.random() * 100000)).toString();
            var board = [[], [], [], [], [], [], [], [], [], []];
            req.body.private = (req.body.private == "on");
            var r = new Room({
                creator: req.body.username,
                name: req.body.roomName,
                board1: board,
                private: req.body.private
            });
            r.save(function (err) {
                if (err) throw err;
                console.log('Room inserted');
            });
            res.redirect('/play?id='+ r._id);
        }
        res.redirect('/?error=alreadyInGame');
    },
    join: function (req, res) {
        if(!req.session.roomID)
        {
            console.log("id = "+req.body.id);
            console.log("name = "+req.body.username);
            Room.findOne({_id: req.body.id}, function (err, room) {
                if (err) throw err;
                //res.json(room);
                if (room.ready == false) {
                    req.session.username = req.body.username;
                    req.session.roomID = room._id;
                    var board = [[], [], [], [], [], [], [], [], [], []];
                    room.ready = true;
                    room.board2 = board;
                    room.player2 = req.body.username;
                    room.save(function (err) {
                        if (err) throw err;
                        console.log('User enter in Room');
                    });

                    res.redirect('/play?id='+ room._id);
                }
                else
                    res.redirect('/?error=full');
            });
        }
        res.redirect('/?error=alreadyInGame');
    },
    joinLink: function (req, res) {
        Room.findOne({_id: req.query.id}, function (err, room) {
            if (err) throw err;
            //res.json(room);
            if (room) {
                if (room.playing == false) {
                    res.render('joinLink',  {title: "Bataille Navale", room : room});
                }
                else
                    res.redirect('/?error=full');
            } else {
                res.redirect('/?error=noroom');
            }

        });
    },
    play:function(req, res){

        Room.findOne({_id: req.query.id}, function(err, room){
            if(err) throw err;
            if(room){
                if (!room.playing) {
                    if(room.ready)
                        room.playing = true;
                    req.session.roomID = room._id;
                     console.log("SESSION : " + JSON.stringify(req.session));
                    res.render('play', {title: "Battaille Navale en cours", session : req.session});
                }
                else if(room._id == req.session.roomID)
                {
                    res.render('play', {title: "Battaille Navale en cours", session : req.session});
                }
                else if(room._id != req.session.roomID)
                {
                    res.redirect('/?error=alreadyInGame');
                }
                else if(room.playing == true)
                {
                    res.redirect('/?error=full');
                }
                else if (room.ready == false)
                {
                    res.redirect('/joinLink');
                }

            } else {
                    res.redirect('/?error=noroom');
            }
        });
    },
    delete : function(id){
        Room.findOne({_id : id}, function(err, room){
            if(err) throw err;
            room.remove();
        });
    }
};

module.exports = Rooms;
