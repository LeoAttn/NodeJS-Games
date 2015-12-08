var io;

var RoomsC = require('../controllers/Rooms');

var isValid = false;

var room = [];

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
            s.emit('hey');///Récupère la session passé en paramètre
            callback(s);
        });
    },
	lobby : function(s){
		s.on('joinLobby', function(data){
            s.session = data;
			if(room[s.session.roomID] === undefined)
			{
				room[s.session.roomID] = {};
                room[s.session.roomID].validationCptr = 0;
				room[s.session.roomID].clients = 0;
				room[s.session.roomID].players = [];
			}	
			if(room[s.session.roomID].clients < 2)
			{
                initLobby(s);
			}
            else
            {
                loadLobby(s);
            }
            s.emit('chatMessage',{from : 'server', type: 'info', msg:  "Bienvenue dans la room !", date : Date.now});
		});
		s.on('startGame', function(){
            s.emit('startGame');
            s.broadcast.to(s.session.roomID).emit('startGame', {});
        });
	},
	chat : function(s){
		s.on('chatMessage', function (msag){
            s.broadcast.to(s.session.roomID).emit('chatMessage',{from : 'user', msg : msag, username: s.session.username, date : Date.now});
            s.emit('chatMessage',{from : 'user', msg:  msag, username : s.session.username, date : Date.now});
            room[s.session.roomID].messagesObjs.push({from : 'user', msg: msag, username : s.session.username, date : Date.now});
        });
	},
    handshake : function(s){
		s.on('hey', function(username){
            console.log("taille username : "+username.length);
            if (username.length > 20)
                username = username.substr(0,20);
			s.session.username = username;
			room[s.session.roomID].players[s.session.playerID].username = username;
            s.broadcast.to(s.session.roomID).emit('addUser',{ username :s.session.username});
            s.emit('addUser', {username : s.session.username});
            if(room[s.session.roomID].clients == 2){
                s.broadcast.to(s.session.roomID).emit('ready', {});
            }
        });
		////////=====================================================================
    },
	game : function(s){
		s.on('joinGame', function (data) {//Appelé en réponse au message handshake, set la session et rejoins la room
            s.session = data;
            console.log('roomID: ' + s.session.roomID);
            if(room[s.session.roomID] === undefined)
            {
                s.emit('redirect', '/');
                return;
            }
            s.session.username = room[s.session.roomID].players[s.session.playerID].username;
            s.join(s.session.roomID);
            if(room[s.session.roomID].players[s.session.playerID].hasJoined === undefined)
            {
                room[s.session.roomID].players[s.session.playerID].hasJoined = true;
                initGame(s);
            }
            else
            {
                loadGame(s);
            }
        });
		///////====================================================
		s.on('batPos', function (pos) {
            console.log(pos);
            console.log('Room ID: '+ s.session.roomID)
            if(room[s.session.roomID].players[s.session.playerID].state == "batPos")
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
                    room[s.session.roomID].players[s.session.playerID].state = "batPosValid";
                    room[s.session.roomID].players[s.session.playerID].batTab = batPos;
                    s.emit('batPosValid');
                    s.emit('notifs', {type : 'info', msg : "La position des bateaux à été validée"})
                    room[s.session.roomID].validationCptr += 1;
                    if(room[s.session.roomID].validationCptr == 2)
                    {
                        s.broadcast.emit('start');
                        s.emit('start');
                        var rand = (Math.round(Math.random()*2));
                        var name;
                        console.log(rand);
                        if(rand == 0)
                            name = "creator";
                        else
                            name = "player2";
                        if(name == s.session.playerID)
                        {
                            s.emit('newState', {state : 'myTurn'});
                            s.broadcast.to(s.session.roomID).emit('newState', {state: 'wait'});
                        }
                        else
                        {
                            s.emit('newState', {state : 'wait'});
                            s.broadcast.to(s.session.roomID).emit('newState', {state : 'myTurn'});
                        }
                        
                    }
                    else
                    {
                        s.broadcast.to(s.session.roomID).emit('notifs', {type : 'info' , msg : "Votre adversaire est prêt !"});
                    }
                }
                else
                    s.emit('notifs', {type : 'error', msg : "Vous n'avez pas mis tous les bateaux !"});
            }
        });
		/////====================================================================
		s.on('tirClient', function (x, y) {
            if (room[s.session.roomID].players[s.session.playerID].state == "myTurn") {
                var type, playerID;
                console.log("position tir : (" + x + ", " + y + ")");
                if (s.session.playerID == 'creator')
                    playerID = 'player2';
                else
                    playerID = 'creator';

                // vide = 0, bat = 1, touche = 2, dansleau = 3
                if(room[s.session.roomID].players[playerID].batTab[x][y] >= 2) {
                    s.emit('notifs', {type : 'error', msg : "Vous avez déja tiré à cette emplacement !"})
                } else {
                    if (room[s.session.roomID].players[playerID].batTab[x][y] == 1) {
                        type = "touche";
                        room[s.session.roomID].players[playerID].batTab[x][y] = 2;
                    } else {
                        type = "dansleau";
                        room[s.session.roomID].players[playerID].batTab[x][y] = 3;
                    }
                    console.log(type);
                    s.emit('tirServ', {tab: 'att', type: type, x: x, y :y});
                    s.emit('newState', {state : 'wait'});
                    s.broadcast.to(s.session.roomID).emit('tirServ', {tab: 'def', type: type, x: x, y :y});
                    s.broadcast.to(s.session.roomID).emit('newState', {state : 'myTurn'});
                }
            }
            //for (var k in varRoom)
            //    console.log(varRoom[k])
        });
        s.on('updateState', function(state){
            room[s.session.roomID].players[s.session.playerID].state = state;
        });
        s.on('hello', function(){
            sendHello(s);
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
    }
};


function initLobby(s)
{
    var tmpUsername = s.session.username;
    if(s.session.username === undefined || s.session.username == '' || s.session.username == ' ' || s.session.username == null)
        tmpUsername = 'Anonyme';
    s.join(s.session.roomID);
    room[s.session.roomID].players[s.session.playerID] = {
        username : tmpUsername
    };
    room[s.session.roomID].clients += 1
}

function loadLobby(s)
{
    s.session.username = room[s.session.roomID].players[s.session.playerID].username;
    if(room[s.session.roomID].messagesObjs !== undefined)
    {
        s.emit('loadMessages', room[s.session.roomID].messagesObjs);
    }
    s.broadcast.to(s.session.roomID).emit('addUser',{ username :s.session.username});
    s.emit('addUser', {username : s.session.username});
}

function initGame(s)
{
    sendHello(s);
    s.emit('newState', {state : 'batPos'});
    room[s.session.roomID].players[s.session.playerID].batTab = [[], [], [], [], [], [], [], [], [], []];   
}

function loadGame(s)
{
    var batTab = room[s.session.roomID].players[s.session.playerID].batTab
    var stateP = room[s.session.roomID].players[s.session.playerID].state

    s.emit('newState', {state : stateP});
    s.emit('placeBoat', batTab);
    sendHello(s);
}

function sendHello(s)
{
    s.emit('me', s.session.username);
    s.broadcast.to(s.session.roomID).emit('opponent', s.session.username);
}

module.exports = IO;
