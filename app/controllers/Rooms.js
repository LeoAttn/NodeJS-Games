require('../models/Room');

var Users = require('./Users');

var mongoose = require("mongoose"),
    Room = mongoose.model('Room');


var Rooms = {

    index: function (req, res) {
        Room.find({}, function (err, rooms) {
            if (err) throw err;
        })
    },
    create: function (req, res) {
        var board = [[], [], [], [], [], [], [], [], [], []];
        var r = new Room({
            creator: req.session.USER,
            board1: board,
            private: req.body.private
        })
    },
    join: function (req, res) {
        Room.findOne({_id: req.query.id}, function (err, room) {
            if (err) throw err;
            if (room.playing == false) {
                var board = [[], [], [], [], [], [], [], [], [], []];
                room.board2 = board;
                room.player2 = req.session.USER;
                room.playing = true;
                res.render('Join', {title: 'Bataille Navale - En cours'});
            }
        })
    }
};

module.exports = Rooms;