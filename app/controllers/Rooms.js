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
            res.render('index', {title: 'Bataille Navale', returnParty: true, session : req.session, room: rooms, message: msg});
        });
    },
    create: function (req, res) {
        if(!req.session.roomID)
        {
            if (req.body.username.length > 20)
                req.body.username = req.body.username.substr(0,20);
            req.session.username = req.body.username;
            if (!(req.body.roomName))
                req.body.roomName = "room_" + (Math.round(Math.random() * 100000)).toString();
            else if (req.body.roomName.length > 20)
                req.body.roomName = req.body.roomName.substr(0,20);
            req.body.private = (req.body.private == "on");
            var r = new Room({
                creator: req.body.username,
                name: req.body.roomName,
                private: req.body.private
            });
            r.save(function (err) {
                if (err) throw err;
                console.log('Room inserted');
            });
            req.session.roomID = r._id;
            req.session.playerID = 'creator';
            res.redirect('/lobby?id='+ r._id);
        }
        else
            res.redirect('/?error=alreadyInGame');
    },
    joinLobby: function (req, res) {
        var roomId;
        if(req.query.roomID)
            roomId = req.query.roomID;
        else
            roomId = req.body.id;
        Room.findOne({_id: roomId}, function (err, room) {
            if (err) throw err;
            //res.json(room);
            if(!req.session.roomID)
            {
                if (room.ready == false) {
                    req.session.username = "Anonyme"
                    req.session.roomID = room._id;
                    room.ready = true;
                    room.player2 = req.session.username;
                    room.save(function (err) {
                        if (err) throw err;
                        console.log('User enter in Room');
                    });
                    req.session.playerID = 'player2';
                    res.redirect('/lobby?id='+ room._id);
                }
                else
                    res.redirect('/?error=full');
            }
            else
                res.redirect('/?error=alreadyInGame');
        });
    },
    lobby: function(req, res)
    {
        if(req.session.roomID == req.query.id)
        {
            Room.findOne({_id : req.query.id}, function(err, room){
                if (err) throw err;
                if(room){
                    res.render('lobby',{title: "Lobby: "+room.name, session : req.session, tRoom: room});
                }
                else
                    res.redirect('/?error=noroom');
            });
        }
        else
        {
            res.redirect('/?error=notAllowed')
        }
    },
    play:function(req, res){
        Room.findOne({_id: req.query.id}, function(err, room){
            if(err) throw err;
            if(room){
                if (req.session.roomID == room._id) {
                    if(room.ready)
                    {
                        room.playing = true;
                        req.session.roomID = room._id;
                        req.cookies.roomID = room._id;
                        res.render('play', {title: "Battaille Navale en cours", session : req.session});
                    }
                    else
                    {
                        res.redirect('/lobby?id='+room._id);
                    }
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
    setReady : function(req, res){
        Room.findOne({_id : req.params.id}, function(err, room){
            if(err) throw err;
            if(room)
            {
                if(req.session.roomID == room._id)
                {
                    room.ready = true;
                    room.save(function (err) {
                        if (err) throw err;
                        console.log('Room updated');
                    });
                }
            }
        });
    },
    delete : function(id){
        Room.findOne({_id : id}, function(err, room){
            if(err) throw err;
            if(room)
                if(!room.ready || room.playing)
                    room.remove();
        });
    }
};

module.exports = Rooms;
