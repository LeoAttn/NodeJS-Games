var io;

var RoomsC = require('../controllers/Rooms');

var isValid = false;

var game = [];

var IO = {
    set: function (IO) { // Cette fonction sera appelé dans le fichier app.js et valorisera la variable io
        io = IO;
        var $this = this; // On enregistre le contexte actuel dans une variable

        //on appelle cette function à chaque connection d'un nouvel utilisateur
        this.connection(function (socket) {

            // Toutes les fonctions que l'on va rajouter devront être ici
            $this.chatMessage(socket);
            $this.startGame(socket);
            $this.hey(socket);
            $this.handshake(socket);
            $this.joinRoom(socket);
            $this.disconnect(socket);
            $this.TirClient(socket);
            $this.BatPos(socket);
        });

    },
    get: function () {
        return io;
    },
    connection: function (callback) {//Appellé lors de la connexion du socket
        io.on('connection', function (socket) {
            console.log("Client Connected ");
            socket.emit('hey');
            socket.emit('handshake');///Récupère la session passé en paramètre
            socket.broadcast.emit('userCount', io.sockets.sockets.length);//Broadcast le nombre de socket connecté
            socket.emit('userCount', io.sockets.sockets.length);
            callback(socket);
        });
    },
    chatMessage : function (socket){
        socket.on('chatMessage', function (msag){
            socket.broadcast.to(socket.handshake.session.roomID).emit('chatMessage',{from : 'user', msg : msag, username: socket.handshake.session.username, date : Date.now});
            socket.emit('chatMessage',{from : 'user', msg:  msag, username : socket.handshake.session.username, date : Date.now});
        });
    },
    startGame : function (socket){
        socket.on('startGame', function(){
            socket.emit('startGame');
            socket.broadcast.to(socket.handshake.session.roomID).emit('startGame', {});
        });
    },
    hey : function (socket){
        socket.on('hey', function(username){
            socket.handshake.session.username = username;
            socket.broadcast.to(socket.handshake.session.roomID).emit('addUser',{ username : socket.handshake.session.username});
            socket.emit('addUser', {username : socket.handshake.session.username});
        });
    },
    handshake : function(socket){
        socket.on('handshake', function(data){
            socket.handshake.session = data;
            socket.join(socket.handshake.session.roomID);
        })
    },
    joinRoom: function (s) {//Appelé en réponse au message handshake, set la session et rejoins la room
        s.on('join', function (data) {
            s.handshake.session = data;
            s.player ={
                        id : 0,
                        username : data.username,
                        batTab : [[],[],[],[],[],[],[],[],[]],
                        hasValid: false,
                        hasLost: false
                     };
            game[s.handshake.session.roomID] = {
                player1 : {
                    username: "",
                    batTab : [],
                    hasValid : false,
                    hasLost : false
                },
                player2 : {
                    username: "",
                    batTab : [],
                    hasValid : false,
                    hasLost : false
                }
            };
            if(io.sockets.sockets.length == 1)
            {
                s.player.id = 1;
                game[s.handshake.session.roomID].player1 = s.player;
            }
            else if(io.sockets.sockets.length == 2)
            {
                s.player.id = 2;
                game[s.handshake.session.roomID].player2 = s.player;
            }
            console.log("Game Vars : " + JSON.stringify(game[s.handshake.session.roomID]));
            s.join(s.handshake.session.roomID);
        })
    },
    disconnect: function (s) {
        s.on('disconnect', function () {
            console.log("Client Disconnected");
            s.leave();
            if (io.sockets.sockets.length == 0)
                RoomsC.delete(s.handshake.session.roomID);
            else// On prévient tout le monde qu'une personne s'est deconnectée
                s.broadcast.to(s.handshake.session.roomID).emit('UserState', io.sockets.sockets.length);
        });
    },
    TirClient: function (s) {
        s.on('TirClient', function (x, y) {
            if (isValid) {
                var type;
                console.log("position tir : (" + x + ", " + y + ")");
                if (varRoom[s.room].Tab1[x][y]) {
                    type = "touche";
                } else {
                    type = "dansleau";
                }
                console.log(type);
                s.emit('TirServ', type, x, y);
            }
            console.log("Name : " + s.username);
            console.log("Room : " + s.room);

            //for (var k in varRoom)
            //    console.log(varRoom[k])
        });
    },
    BatPos: function (s) {
        s.on('BatPos', function (pos) {
            console.log(pos);
            if(!s.player.hasValid)
            {
                var batPos = [[], [], [], [], [], [], [], [], [], []];
                for (var y = 0; y < 10; y++)
                    for (var x = 0; x < 10; x++)
                        batPos[x][y] = 0;
                var bat, nbBat = 0;
                for (var k in pos) {
                    if (bat = pos[k].match(/[0-9]+/ig)) {
                        batPos[parseInt(bat[0])][parseInt(bat[1])] = 1;
                        nbBat++;
                    } else {
                        s.emit('Message', k + ' non defini !');
                    }
                }
                if (nbBat == 5) {
                    s.player.hasValid = true;
                    s.player.batTab = batPos;
                    console.log("Player Vars : " + JSON.stringify(s.handshake.player));
                    s.emit('PosBatValid');
                    s.broadcast.emit('playerReady');
                    s.broadcast.emit('info', "Votre adversaire est prêt !");
                    if(game[s.handshake.session.roomID].player1.hasValid && game[s.handshake.session.roomID].player2.hasValid)
                    {
                        s.broadcast.emit('start');
                        s.emit('start');
                        s.emit('turn');
                        var rand = Math.round(Math.random()*2);
                        console.log(rand);
                        if(rand == s.player.id)
                            s.emit('uRturn');
                        else
                            s.broadcast('uRturn');

                    }
                }
                else
                    s.emit('errorMsg', "Vous n'avez pas mis tous les bateaux !");
            }
        });
    }
};

module.exports = IO;
