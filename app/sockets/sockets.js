var io;
var chat;
var RoomsC = require('../controllers/Rooms');

var isValid = false;

var room = [];

var IO = {
    set: function (IO) { // Cette fonction sera appelé dans le fichier app.js et valorisera la variable io
        io = IO;
        chat = io.of('/chat');
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
        chat.on('connection', function(s){
            console.log('CHAT CONNECTED !! ');
            s.emit('hey');
            callback(s);
        });
    },
    handshake: function (s) {
        s.on('hey', function (username) {
            console.log("taille username : " + username.length);
            if (username.length > 20)
                username = username.substr(0, 20);
            s.session.username = username;
            room[s.session.roomID].players[s.session.playerID].username = username;
            s.broadcast.to(s.session.roomID).emit('addUser', {username: s.session.username});
            s.emit('addUser', {username: s.session.username});
        });
        ////////=====================================================================
    },
    lobby: function (s) {
        s.on('joinLobby', function (data) {
            s.session = data;
            if (room[s.session.roomID] === undefined) {
                room[s.session.roomID] = {};
                room[s.session.roomID].validationCptr = 0;
                room[s.session.roomID].clients = 0;
                room[s.session.roomID].players = [];
                room[s.session.roomID].messagesObjs = [];
                room[s.session.roomID].nbBat = 5;
            }
            if (room[s.session.roomID].clients < 2 && room[s.session.roomID].players[s.session.playerID] === undefined) {
                console.log("INIT LOBBY");
                initLobby(s);
            }
            else {
                loadLobby(s);
            }
            if (room[s.session.roomID].clients == 2) {
                if(s.session.playerID == "creator")
                    s.emit('ready', {});
                else
                    s.broadcast.to(s.session.roomID).emit('ready', {});
            }

        });
        s.on('sendUsername', function (username){
            //if(username != "Anonyme" || username != "" || username != )
            s.emit("addUser", {username : s.session.username});
            s.broadcast.to(s.session.roomID).emit("addUser", {bypass : false, username:s.session.username});
        })
        s.on('changeNbBat', function (nb) {
            nb = parseInt(nb);
            if (nb >= 1 && nb <= 10) {
                room[s.session.roomID].nbBat = nb;
            }
        });
        s.on('startGame', function () {
            s.emit('startGame');
            s.broadcast.to(s.session.roomID).emit('startGame', {});
        });
    },
    chat: function (s) {
        s.on('joinChat', function (data){
            s.session = data;
            s.session.username = room[s.session.roomID].players[s.session.playerID].username;
            s.join(s.session.roomID)
            if(room[s.session.roomID].messagesObjs === undefined){
                room[s.session.roomID].messagesObjs = {};
                s.emit('chatMessage', {
                    from: 'server',
                    type: 'info',
                    msg: "Bienvenue dans la room !",
                    date: Date.now
                });
            }
            else{
                loadMessages(s);
            }
        });
        s.on('chatMessage', function (msag) {
            s.broadcast.to(s.session.roomID).emit('chatMessage', {
                from: 'user',
                msg: msag,
                username: s.session.username,
                date: Date.now
            });
            s.emit('chatMessage', {
                from: 'user',
                msg: msag,
                username: s.session.username,
                date: Date.now
            });
            room[s.session.roomID].messagesObjs.push({from : 'user', msg: msag, username : s.session.username, date : Date.now});
        });
    },
    game: function (s) {
        s.on('joinGame', function (data) {//Appelé en réponse au message handshake, set la session et rejoins la room
            s.session = data;
            console.log('roomID: ' + s.session.roomID);

            if (room[s.session.roomID] === undefined) {
                s.emit('redirect', '/');
                return;
            }
            s.emit('nbBat', room[s.session.roomID].nbBat);
            s.session.username = room[s.session.roomID].players[s.session.playerID].username;
            s.join(s.session.roomID);
            if (room[s.session.roomID].players[s.session.playerID].hasJoined === undefined) {
                room[s.session.roomID].players[s.session.playerID].hasJoined = true;
                initGame(s);
            }
            else if (room[s.session.roomID].players[s.session.playerID].state == "batPos") {
                changeState(s, s.session.playerID, 'batPos');
                sendHello(s);
            }
            else {
                loadGame(s);
            }
        });
        ///////====================================================
        s.on('batPos', function (pos) {
            console.log(pos);
            console.log('Room ID: ' + s.session.roomID)
            if (room[s.session.roomID].players[s.session.playerID].state == "batPos") {
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
                if (nbBat == room[s.session.roomID].nbBat) {
                    changeState(s, s.session.playerID, 'batPosValid');
                    room[s.session.roomID].players[s.session.playerID].batTab = batPos;
                    room[s.session.roomID].players[s.session.playerID].batCoule = 0;
                    s.emit('batPosValid');
                    s.emit('notifs', {type: 'info', msg: "La position des bateaux à été validée"})
                    room[s.session.roomID].validationCptr += 1;
                    if (room[s.session.roomID].validationCptr == 2) {
                        s.broadcast.emit('start');
                        s.emit('start');
                        var rand = (Math.round(Math.random()));
                        console.log('rand = ' + rand);
                        var firstPlayerID = (rand == 0) ? "creator" : "player2";
                        var secondPlayerID = (firstPlayerID == "creator") ? "player2" : "creator";
                        changeState(s, firstPlayerID, 'myTurn');
                        changeState(s, secondPlayerID, 'wait');
                    }
                    else {
                        s.broadcast.to(s.session.roomID).emit('notifs', {
                            type: 'info',
                            msg: "Votre adversaire est prêt !"
                        });
                    }
                }
                else
                    s.emit('notifs', {type: 'error', msg: "Vous n'avez pas mis tous les bateaux !"});
            }
        });
        /////====================================================================
        s.on('tirClient', function (x, y) {
            if (room[s.session.roomID].players[s.session.playerID].state == "myTurn") {
                var type;

                var opponentID = (s.session.playerID == 'creator') ? 'player2' : 'creator';

                // vide = 0, bat = 1, touche = 2, dansleau = 3
                if (room[s.session.roomID].players[opponentID].batTab[x][y] >= 2) {
                    s.emit('notifs', {type: 'error', msg: "Vous avez déja tiré à cette emplacement !"})
                } else {
                    if (room[s.session.roomID].players[opponentID].batTab[x][y] == 1) {
                        type = "touche";
                        room[s.session.roomID].players[opponentID].batTab[x][y] = 2;
                        room[s.session.roomID].players[opponentID].batCoule++;
                    } else {
                        type = "dansleau";
                        room[s.session.roomID].players[opponentID].batTab[x][y] = 3;
                    }
                    console.log(type);
                    s.emit('tirServ', {tab: 'att', type: type, x: x, y: y});
                    s.broadcast.to(s.session.roomID).emit('tirServ', {tab: 'def', type: type, x: x, y: y});
                    changeState(s,s.session.playerID, 'wait');
                    changeState(s,opponentID, 'myTurn');

                    if (room[s.session.roomID].players[opponentID].batCoule == room[s.session.roomID].nbBat) {
                        changeState(s, s.session.playerID, 'win');
                        changeState(s, opponentID, 'loose')
                        s.emit('notifs', {type: 'info', msg: "Vous avez gagné !"});
                        s.broadcast.to(s.session.roomID).emit('notifs', {type: 'info', msg: "Vous avez perdu !"});
                    }
                }
            }
            //for (var k in varRoom)
            //    console.log(varRoom[k])
        });
        s.on('hello', function () {
            sendHello(s);
        });
        s.on('quit', function () {
            quitGame(s);
            s.emit('redirect', '/flush-session');
        });
        s.on('askRematch', function () {
            room[s.session.roomID].players[s.session.playerID].state = 'askRmtch';
            s.broadcast.to(s.session.roomID).emit('askRematch');
        });
        s.on('acceptRematch', function () {
            s.emit('rematch');
            s.broadcast.to(s.session.roomID).emit('rematch');
        });
        s.on('rematch', function() {
            rematch(s);
        });
    },
    disconnect: function (s) {
        s.on('disconnect', function () {
            console.log("Client Disconnected");
            //quitGame(s);
        });
    }
};

function initLobby(s) {
    if (s.session.username === undefined || s.session.username == '' || s.session.username == ' ' || s.session.username == null || s.session.username == 'Anonyme'){
        s.emit("askUsername");
    }
    else{
        room[s.session.roomID].players[s.session.playerID] = {
                username: s.session.username
        };
        s.emit("addUser", {username : s.session.username});
        s.broadcast.to(s.session.roomID).emit("addUser", {username:s.session.username});
        room[s.session.roomID].clients += 1;
    }
    s.join(s.session.roomID);
}

function loadLobby(s) {
    if(s.session.username == "Anonyme")
        s.emit("updateUsername", room[s.session.roomID].players[s.session.playerID].username);
    s.session.username = room[s.session.roomID].players[s.session.playerID].username;
    s.join(s.session.roomID);
    s.broadcast.to(s.session.roomID).emit('addUser', {bypass : true ,username: s.session.username});
    s.emit('addUser', {bypass : false, username: s.session.username});
    if (room[s.session.roomID].clients == 2) {
        if(s.session.playerID == "creator")
            s.emit('ready', {});
        else
            s.broadcast.to(s.session.roomID).emit('ready', {});
    }
}

function loadMessages(s){
    s.emit('loadMessages', room[s.session.roomID].messagesObjs);
}

function initGame(s) {
    sendHello(s);
    room[s.session.roomID].players[s.session.playerID].state = "";
    changeState(s,s.session.playerID, 'batPos');
    room[s.session.roomID].players[s.session.playerID].batTab = [[], [], [], [], [], [], [], [], [], []];
}

function loadGame(s) {
    var batTab = room[s.session.roomID].players[s.session.playerID].batTab;
    var stateP = room[s.session.roomID].players[s.session.playerID].state;
    var playerID, tirTab = [[], [], [], [], [], [], [], [], [], []];
    playerID = (s.session.playerID == 'creator') ? 'player2' : 'creator';
    for (var y = 0; y < 10; y++) {
        for (var x = 0; x < 10; x++) {
            if (room[s.session.roomID].players[playerID].batTab[x][y] <= 1) {
                tirTab[x][y] = 0;
            } else {
                tirTab[x][y] = room[s.session.roomID].players[playerID].batTab[x][y];
            }
        }
    }

    s.emit('updateState', {state: stateP});
    s.emit('placeBoat', batTab, tirTab);
    s.emit('batPosValid');
    sendHello(s);
}

function sendHello(s) {
    s.emit('me', s.session.username);
    s.broadcast.to(s.session.roomID).emit('opponent', s.session.username);
}

function quitGame(s){
    room[s.session.roomID].clients --;
    if(room[s.session.roomID].clients == 0)
    {
        RoomsC.delete(socket.request, socket.response);
    }
    else
    {
        s.broadcast.to(s.session.roomID).emit('userLeft', s.session.username);
        s.broadcast.to(s.session.roomID).emit('chatMessage', {from: 'server', type: 'info', msg: s.session.username + " à quitté la partie", date: Date.now});
    }
    s.leave();
}

function rematch(s){
    delete room[s.session.roomID].players[s.session.playerID].hasJoined
}

function cleanRoom(s){
    delete room[s.session.roomID];
}

function changeState(s, playerID, newState){
    room[s.session.roomID].players[playerID].state = newState;
    if(playerID == s.session.playerID)
    {
        s.emit('updateState', {state: newState});
    }
    else
    {
        s.broadcast.to(s.session.roomID).emit('updateState', {state: newState});
    }

}

module.exports = IO;
