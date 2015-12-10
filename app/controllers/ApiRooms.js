require('../models/Room');

var Users = require('./Users');

var mongoose = require("mongoose"),
    Room = mongoose.model('Room');


var apiRooms = {
    create: function (req, res) {

    },
    index: function (req, res) {
        Room.find({}, function (err, rooms) {
            if (err) throw err;
            //res.json(rooms);
            res.status(200).json(rooms);
            res.end();
        });
    },
    update : function (req, res) {
        Room.findOne({_id: req.params.id}, function (err, room) {
            if (err) throw err;
            if (room) {
                room.ready = true;
                room.save(function (err) {
                    if (err) throw err;
                    console.log('Room updated');
                    console.log("SUCCESS : STATUS 200")
                    res.status(200).send('success !');
                    res.end();
                });
            }
            else {
                console.log("ERROR : NO CONTENT STATUS 204")
                res.status(204).send('No content !');
                res.end();
            }
        });
    },
    delete: function (req, res) {
        Room.findOne({_id: req.params.id}, function (err, room) {
            if (err) throw err;
            if (room) {
                if (!room.ready || room.playing) {
                    room.remove();
                    res.status(200).send('Success !');
                    res.end();
                }
                res.status(300).send('Forbidden !');
                res.end();
            }
            else {
                res.status(204).send('No content !');
                res.end();
            }
        });
    },
    joinLobby: function (req, res) {

    },
    lobby: function (req, res) {

    },
    play: function (req, res) {

    }
};

module.exports = apiRooms;
