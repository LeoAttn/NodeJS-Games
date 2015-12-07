var io;

var RoomsC = require('../controllers/Rooms');

var isValid = false;

var room = [];
room.clients = 0;

var IO = {
    set: function (IO) { // Cette fonction sera appelé dans le fichier app.js et valorisera la variable io
        io = IO;
        var $this = this; // On enregistre le contexte actuel dans une variable

        //on appelle cette function à chaque connection d'un nouvel utilisateur
        this.connection(function (socket) {

            // Toutes les fonctions que l'on va rajouter devront être ici
			$this.lobby(socket);
            $this.chat(socket);
            $this.game(socket);
            $this.handshake(socket);
            $this.disconnect(socket);
        });

    },
    get: function () {
        return io;
    },
    connection: function (callback) {//Appellé lors de la connexion du socket
        io.on('connection', function (s) {
            console.log("Client Connected ");
			s.emit('handshake');///Récupère la session passé en paramètre
            s.emit('hey');
            s.broadcast.emit('userCount', io.sockets.sockets.length);//Broadcast le nombre de socket connecté
            s.emit('userCount', io.sockets.sockets.length);
            callback(s);
        });
    },
	lobby : function(s){
		s.on('joinLobby', function(data){
            s.session = data;
			if(room[s.session.roomID] === undefined)
			{
				room[s.session.roomID] = {}
				room[s.session.roomID].clients = 0;
				room[s.session.roomID].players =[];
			}	
			if(room[s.session.roomID].clients != 2)
			{
				s.join(s.session.roomID);
				s.playerID = room[s.session.roomID].clients.toString;
				room[s.session.roomID].players[s.playerID] = {
					username : s.session.username
				}
				room[s.session.roomID].clients += 1
				console.log('User entered !');
				console.log('room: ', JSON.stringify(room[s.session.roomID]));
				if(room[s.session.roomID].clients == 2){
					s.broadcast.to(s.session.roomID).emit('ready', {});
				}
			}
        });
		s.on('startGame', function(){
            s.emit('startGame');
            s.broadcast.to(s.session.roomID).emit('startGame', {});
        });
	},
	chat : function(s){
		s.on('chatMessage', function (msag){
			console.log("Msg : " + msag + "from user: " + s.session.username);
            s.broadcast.to(s.session.roomID).emit('chatMessage',{from : 'user', msg : msag, username: s.session.username, date : Date.now});
            s.emit('chatMessage',{from : 'user', msg:  msag, username : s.session.username, date : Date.now});
        });
	},
    handshake : function(s){
		s.on('hey', function(username){
			console.log('store username: ' + s.session.username + ' user ' + username);
			s.session.username = username;
			console.log("Room: " + JSON.stringify(room[s.session.roomID].players[s.playerID]));
			room[s.session.roomID].players[s.playerID].username = username;
            s.broadcast.to(s.session.roomID).emit('addUser',{ username : s.session.username});
            s.emit('addUser', {username : s.session.username});
        });
		////////=====================================================================
    },
	game : function(s){
		s.on('join', function (data) {//Appelé en réponse au message handshake, set la session et rejoins la room
            s.session = data;
            s.player ={
                        id : 0,
                        username : data.username,
                        batTab : [[],[],[],[],[],[],[],[],[]],
                        state: "",
                        hasLost: false
                     };
            game[s.session.roomID] = {
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
                s.player.state = "attj2";
                game[s.session.roomID].player1 = s.player;
            }
            else if(io.sockets.sockets.length == 2)
            {
                s.player.id = 2;
                s.player.state = "attj2";
                game[s.session.roomID].player2 = s.player;
            }
            console.log("Game Vars : " + JSON.stringify(game[s.session.roomID]));
            s.join(s.session.roomID);
        });
		///////====================================================
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
                    console.log("Player Vars : " + JSON.stringify(s.player));
                    s.emit('PosBatValid');
                    s.broadcast.emit('playerReady');
                    s.broadcast.emit('info', "Votre adversaire est prêt !");
                    if(game[s.session.roomID].player1.hasValid && game[s.session.roomID].player2.hasValid)
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
		/////====================================================================
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
    disconnect: function (s) {
        s.on('disconnect', function () {
            console.log("Client Disconnected");
            s.leave();
            /*if (io.sockets.sockets.length == 0)
                RoomsC.delete(s.session.roomID);
            else// On prévient tout le monde qu'une personne s'est deconnectée
                s.broadcast.to(s.session.roomID).emit('UserState', io.sockets.sockets.length);*/
        });
    },
};

module.exports = IO;
