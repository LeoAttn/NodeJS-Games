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

        Room.find({}, function (err, rooms) {
            if (err) throw err;
            //res.json(rooms);
            res.render('index', {title: 'Bataille Navale', room: rooms, message: msg});
        });
    },
    create: function (req, res) {
<<<<<<< HEAD
        req.session.username = req.body.username;
=======
>>>>>>> origin/master
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
    },
    join: function (req, res) {
        console.log("id = "+req.body.id);
        console.log("name = "+req.body.username);
        Room.findOne({_id: req.body.id}, function (err, room) {
            if (err) throw err;
            //res.json(room);
            if (room.ready == false) {
                var board = [[], [], [], [], [], [], [], [], [], []];
                room.ready = true;
                room.board2 = board;
                room.player2 = req.body.username;
                room.playing = true;
                room.save(function (err) {
                    if (err) throw err;
                    console.log('User enter in Room');
                });

                res.redirect('/play?id='+ room._id);
            }
            else
                res.redirect('/?error=full');
        });
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
<<<<<<< HEAD
                if (!room.playing) {
                    if(room.ready)
                        room.playing = true;
                    req.session.roomID = room._id;
                     console.log("SESSION : " + JSON.stringify(req.session));
                    res.render('play', {title: "Battaille Navale en cours", session : req.session});
=======
                if (room.playing != false) {
                    res.render('play', {title: "Bataille Navale en cours", room : room});
>>>>>>> origin/master
                }
                else if(room.playing == true)
                {
                    res.redirect('/?error=full');
                }
                else
                {
                    res.redirect('/?error=joinFirst');
                }

            } else {
                    res.redirect('/?error=noroom');
            }
        });
    }
};

module.exports = Rooms;
