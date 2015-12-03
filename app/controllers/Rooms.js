require('../models/Room');

var Users = require('./Users');

var mongoose = require("mongoose"),
    Room = mongoose.model('Room');


var Rooms = {

    index: function (req, res) {
        Room.find({}, function (err, rooms) {
            if (err) throw err;
            //res.json(rooms);
            res.render('index', {title: 'Bataille Navale', room: rooms});
        });
    },
    create: function (req, res) {
        var board = [[], [], [], [], [], [], [], [], [], []];
        var r = new Room({
            //creator: req.session.USER,
            board1: board,
            private: false//req.body.private
        });
        r.save(function (err) {
            if (err) throw err;
            console.log('User inserted');
        });
        res.redirect('/');
    },
    join: function (req, res) {
        Room.findOne({_id: req.body.id}, function (err, room) {
            if (err) throw err;
            //res.json(room);
            if (room.playing == false) {
                var board = [[], [], [], [], [], [], [], [], [], []];
                room.board2 = board;
                room.player2 = req.session.USER;
                room.playing = true;
                room.save();
                res.render('play', {title: 'Bataille Navale - En cours'});
            }
        });
    }
};

module.exports = Rooms;