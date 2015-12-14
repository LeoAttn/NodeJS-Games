var io;
var chat;
var http = require('http');
var RoomsC = require('../controllers/Rooms');
var UsersC = require('../controllers/Users');
var isValid = false;
var room = [];
var timerFunction;
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
            $this.timer(socket);
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
            s.broadcast.to(s.session.roomID).emit('addUser', {username: s.session.username, avatar : s.session.avatarLink});
            s.emit('addUser', {username: s.session.username, avatar : s.session.avatarLink});
        });
        ////////=====================================================================
    },
    lobby: function (s) {
        s.on('joinLobby', function (data) {
            s.session = data;
            s.socketID = "lobby";
            if (room[s.session.roomID] === undefined) {
                room[s.session.roomID] = {};
                room[s.session.roomID].clients = 0;
                room[s.session.roomID].players = [];
                room[s.session.roomID].state = "lobby";
                room[s.session.roomID].nbBat = 5;
            }
            if (room[s.session.roomID].clients < 2 && room[s.session.roomID].players[s.session.playerID] === undefined) {
                console.log("INIT LOBBY");
                initLobby(s);
            }
            else {
                if(room[s.session.roomID].clients < 2)
                    room[s.session.roomID].clients ++;
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
            s.emit("addUser", {username : s.session.username, avatar : s.session.avatarLink});
            s.broadcast.to(s.session.roomID).emit("addUser", {bypass : false, username:s.session.username, avatar : s.session.avatarLink});
        });
        s.on('changeNbBat', function (nb) {
            nb = parseInt(nb);
            if (nb >= 1 && nb <= 10) {
                room[s.session.roomID].nbBat = nb;
            }
        });
        s.on('startGame', function () {
            room[s.session.roomID].state = "transition";
            s.emit('startGame');
            s.broadcast.to(s.session.roomID).emit('startGame', {});
        });
    },
    chat: function (s) {
        s.on('joinChat', function (data){
            s.socketID = "chat";
            s.session = data;
            s.session.username = room[s.session.roomID].players[s.session.playerID].username;
            s.join(s.session.roomID);
            if(room[s.session.roomID].players[s.session.playerID].messagesObjs === undefined) {
                room[s.session.roomID].players[s.session.playerID].messagesObjs = [];
                servMessage(s, 'info', "Bienvenue dans la room !");
            }else{
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
            room[s.session.roomID].players[s.session.playerID].messagesObjs.push({
                from: 'user',
                msg: msag,
                username: s.session.username,
                date: Date.now
            });
            var opponentID = (s.session.playerID == "creator") ? "player2" : "creator";
            if(room[s.session.roomID].players[opponentID] === undefined ||
                room[s.session.roomID].players[opponentID].messagesObjs === undefined) {
                // vide
            } else {
                room[s.session.roomID].players[opponentID].messagesObjs.push({
                    from: 'user',
                    msg: msag,
                    username: room[s.session.roomID].players[opponentID].username,
                    date: Date.now
                });
            }
        });
    },
    game: function (s) {
        s.on('joinGame', function (data) {//Appelé en réponse au message handshake, set la session et rejoins la room
            s.session = data;
            s.socketID = "game";
            console.log('roomID: ' + s.session.roomID);

            if (room[s.session.roomID] === undefined) {
                s.emit('redirect', '/');
                return;
            }
            s.emit('nbBat', room[s.session.roomID].nbBat);
            s.session.username = room[s.session.roomID].players[s.session.playerID].username;
            room[s.session.roomID].state = "game";
            s.join(s.session.roomID);
            if(room[s.session.roomID].validationCptr === undefined)
                room[s.session.roomID].validationCptr = 0;
            if (room[s.session.roomID].players[s.session.playerID].hasJoined === undefined) {
                room[s.session.roomID].players[s.session.playerID].hasJoined = true;
                initGame(s);
            }
            else {
                if(room[s.session.roomID].clients < 2)
                    room[s.session.roomID].clients ++;
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
                    }
                }
                //randomPlaceBat(nbBat, batPos);
                if(nbBat != room[s.session.roomID].nbBat)
                {
                    while(nbBat != room[s.session.roomID].nbBat)
                    {
                        var randX = Math.floor(Math.random() * 9);
                        var randY = Math.floor(Math.random() * 9);
                        if(batPos[randX][randY] != 1)
                        {
                            batPos[randX][randY] = 1;
                            nbBat ++;
                        }
                    }
                    var tirTab = [[], [], [], [], [], [], [], [], [], []];
                    for(var x =0; x < 10; x++){
                        for(var y = 0; y <10; y ++){
                            tirTab[x][y] = 0;
                        }
                    }
                    s.emit('removeBoatContainer');
                    s.emit('placeBoat', batPos, tirTab);
                }
                changeState(s, s.session.playerID, 'batPosValid');
                stopCountdown(s, s.session.playerID);
                resetCountdown(s, s.session.playerID);
                room[s.session.roomID].players[s.session.playerID].batTab = batPos;
                room[s.session.roomID].players[s.session.playerID].batCoule = 0;
                servMessage(s, 'success', "La position des bateaux à été validée.");
                room[s.session.roomID].validationCptr += 1;
                if (room[s.session.roomID].validationCptr == 2) {
                    s.broadcast.emit('start');
                    s.emit('start');
                    var rand = Math.round(Math.random());
                    console.log('rand = ' + rand);
                    var firstPlayerID = (rand == 0) ? "creator" : "player2";
                    var secondPlayerID = (firstPlayerID == "creator") ? "player2" : "creator";

                    var msgFirst = "C'est à vous de commencer la partie !";
                    var msgSecond = "C'est votre adversaire qui commence la partie !";
                    var msgPlayer = (s.session.playerID == firstPlayerID) ? msgFirst : msgSecond;
                    var msgOpponent = (s.session.playerID == secondPlayerID) ? msgFirst : msgSecond;
                    servMessage(s, 'info', msgPlayer);
                    servMessage(s, 'info', msgOpponent, 'broadcast');

                    changeState(s, firstPlayerID, 'myTurn');
                    changeState(s, secondPlayerID, 'wait');
                    startCountdown(s, firstPlayerID);
                }
                else {
                    servMessage(s, 'info', "Veuillez attendre que votre adversaire place ses bateaux.");
                    servMessage(s, 'info', "Votre adversaire est prêt !", 'broadcast');
                }
            }
        });
        /////====================================================================
        s.on('tirClient', function (x, y) {
            if (room[s.session.roomID].players[s.session.playerID].state == "myTurn") {
                var type;

                var opponentID = (s.session.playerID == 'creator') ? 'player2' : 'creator';

                // vide = 0, bat = 1, touche = 2, dansleau = 3
                if (room[s.session.roomID].players[opponentID].batTab[x][y] >= 2) {
                    servMessage(s, 'danger', "Vous avez déja tiré à cet emplacement !");
                } else {
                    stopCountdown(s, s.session.playerID);
                    resetCountdown(s, s.session.playerID);
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
                    nextTurn(s, opponentID);
                    startCountdown(s, opponentID);

                    if (room[s.session.roomID].players[opponentID].batCoule == room[s.session.roomID].nbBat) {
                        stopCountdown(s, opponentID);
                        UsersC.addWin(s.session.username);
                        changeState(s, s.session.playerID, 'win');
                        changeState(s, opponentID, 'loose');
                    }
                }
            }
        });
        s.on('hello', function () {
            sendHello(s);
        });
        s.on('quitGame', function () {
            s.emit('redirect', '/flush-session');
            s.broadcast.to(s.session.roomID).emit('redirect', '/flush-session');
        });
        s.on('askRematch', function () {
            changeState(s, s.session.playerID, 'askRematch');
            s.broadcast.to(s.session.roomID).emit('askRematch');
        });
        s.on('acceptRematch', function () {
            rematch(s);
            s.emit('rematch');
            s.broadcast.to(s.session.roomID).emit('rematch');
        });
        s.on('refuseRematch', function (){
            s.emit('redirect', '/flush-session');
            s.broadcast.to(s.session.roomID).emit('redirect', '/flush-session');
        });
        s.on('rematch', function() {
            console.log(room[s.session.roomID].clients);
            if(room[s.session.roomID].clients == 2)
            {
                console.log("REMATCH! ");
                s.emit('redirect', '/play?id='+ s.session.roomID);
                s.broadcast.to(s.session.roomID).emit('redirect', '/play?id=' + s.session.roomID);
            }
            else
            {
                s.emit('redirect', '/flush-session');
            }
        });
    },
    disconnect: function (s) {
        s.on('disconnect', function () {
            if(s.socketID == "chat")
            {
                s.broadcast.to(s.session.roomID).emit('chatMessage', {
                    from: 'server',
                    type: 'info',
                    msg: s.session.username + " à quitté la partie",
                    date: Date.now
                });
            }
            if(s.socketID == "lobby" || s.socketID == "game")
            {
                if ((room[s.session.roomID])) {

                    console.log('state='+room[s.session.roomID].state);
                    if(room[s.session.roomID].state != "transition")//Permet d'ignorer la destruction de la partie lors de la transition lobby -> game
                    {
                        room[s.session.roomID].clients --;
                        if(s.session.playerID == "creator" && s.socketID == "lobby")
                        {
                            s.broadcast.to(s.session.roomID).emit('redirect', '/?error=OwnerQuit');
                        }
                        console.log("Clients : " + room[s.session.roomID].clients);
                        if(room[s.session.roomID].clients <= 0)
                        {
                            RoomsC.delete(s.session.roomID);
                        }
                    }
                }
            }
            console.log("Client Disconnected");
        });
    },
    timer : function(s){

    }
};

function initLobby(s) {
    var opponentID = (s.session.playerID == "creator") ? "player2" : "creator";
    if (s.session.username === undefined || s.session.username == '' || s.session.username == ' ' || s.session.username == null){
        s.emit("askUsername");
    }
    else{
        room[s.session.roomID].players[s.session.playerID] = {
                username: s.session.username
        };
        s.emit("addUser", {username : s.session.username, avatar : s.session.avatarLink});
        s.broadcast.to(s.session.roomID).emit("addUser", {username:s.session.username, avatar : s.session.avatarLink});
        room[s.session.roomID].clients += 1;
    }
    s.join(s.session.roomID);
}

function loadLobby(s) {
    if(s.session.username == "Anonyme")
        s.emit("updateUsername", room[s.session.roomID].players[s.session.playerID].username);
    s.session.username = room[s.session.roomID].players[s.session.playerID].username;
    s.join(s.session.roomID);
    s.broadcast.to(s.session.roomID).emit('addUser', {bypass : true ,username: s.session.username, avatar : s.session.avatarLink});
    s.emit('addUser', {bypass : false, username: s.session.username, avatar : s.session.avatarLink});
    if (room[s.session.roomID].clients == 2) {
        if(s.session.playerID == "creator")
            s.emit('ready', {});
        else
            s.broadcast.to(s.session.roomID).emit('ready', {});
    }
}

function loadMessages(s){
    s.emit('loadMessages', room[s.session.roomID].players[s.session.playerID].messagesObjs);
}

function sendHello(s) {
    s.emit('me', s.session.username);
    s.broadcast.to(s.session.roomID).emit('opponent', s.session.username);
}

function initGame(s) {
    sendHello(s);
    room[s.session.roomID].players[s.session.playerID].state = "";
    changeState(s,s.session.playerID, 'batPos');
    room[s.session.roomID].players[s.session.playerID].batTab = [[], [], [], [], [], [], [], [], [], []];
    resetCountdown(s, s.session.playerID);
    startCountdown(s, s.session.playerID);
    setTimeout(function() {
        servMessage(s, 'info', "Veuillez placer les bateaux sur votre plateau.");

    }, 200);
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
    sendHello(s);
}

function nextTurn(s, opponentID){
    changeState(s,s.session.playerID, 'wait');
    changeState(s,opponentID, 'myTurn');
}

function stopCountdown(s, playerID)
{
    clearInterval(room[s.session.roomID].players[playerID].timerFunction);
    s.emit("countdown", "x");
}

function resetCountdown(s, playerID){
    room[s.session.roomID].players[playerID].timer = 10;
}

function startCountdown(s, playerID){
    // Pour bloquer le compteur :
    //return 0;
    // --------------------------
    console.log("Started Countdown for " + playerID + "(" + room[s.session.roomID].players[playerID].username + ")");
    room[s.session.roomID].players[playerID].timerFunction = setInterval(function(){
        room[s.session.roomID].players[playerID].timer--;
        if(room[s.session.roomID].players[playerID].timer >=0)
            if(playerID == s.session.playerID)
                s.emit('countdown', room[s.session.roomID].players[playerID].timer);
            else
                s.broadcast.to(s.session.roomID).emit('countdown', room[s.session.roomID].players[playerID].timer);
        else{
            if(playerID == s.session.playerID)
                s.emit('notifs', {type : 'info', msg : "Temps Ecoulé"});
            else
                s.broadcast.to(s.session.roomID).emit('info', {type : 'info', msg : "Temps Ecoulé"})

            if(room[s.session.roomID].players[playerID].state == "batPos")
            {
                s.emit('cleanTab');
                var batPos = [[], [], [], [], [], [], [], [], [], []];
                var nbBat = 0;
                ///FUNCTION RANDOM POSITION DES BATEAUX
                while(nbBat != room[s.session.roomID].nbBat)
                {
                    var randX = Math.floor(Math.random() * 9);
                    var randY = Math.floor(Math.random() * 9);
                    if(batPos[randX][randY] != 1)
                    {
                        batPos[randX][randY] = 1;
                        nbBat ++;
                    }
                }
                var tirTab = [[], [], [], [], [], [], [], [], [], []];
                for(var x =0; x < 10; x++){
                    for(var y = 0; y <10; y ++){
                        tirTab[x][y] = 0;
                    }
                }
                s.emit('removeBoatContainer');
                s.emit('placeBoat', batPos, tirTab);
                changeState(s, s.session.playerID, 'batPosValid');
                stopCountdown(s, s.session.playerID);
                resetCountdown(s, s.session.playerID);
                room[s.session.roomID].players[s.session.playerID].batTab = batPos;
                room[s.session.roomID].players[s.session.playerID].batCoule = 0;
                servMessage(s, 'warning', "La position des bateaux à été choisi aléatoirement car vous avez depassé le temps imparti.");

                room[s.session.roomID].validationCptr += 1;
                if (room[s.session.roomID].validationCptr == 2) {
                    s.broadcast.emit('start');
                    s.emit('start');
                    var rand = Math.round(Math.random());
                    console.log('rand = ' + rand);
                    var firstPlayerID = (rand == 0) ? "creator" : "player2";
                    var secondPlayerID = (firstPlayerID == "creator") ? "player2" : "creator";

                    var msgFirst = "C'est à vous de commencer la partie !";
                    var msgSecond = "C'est votre adversaire qui commence la partie !";
                    var msgPlayer = (s.session.playerID == firstPlayerID) ? msgFirst : msgSecond;
                    var msgOpponent = (s.session.playerID == secondPlayerID) ? msgFirst : msgSecond;
                    servMessage(s, 'info', msgPlayer);
                    servMessage(s, 'info', msgOpponent, 'broadcast');

                    changeState(s, firstPlayerID, 'myTurn');
                    changeState(s, secondPlayerID, 'wait');
                    startCountdown(s, firstPlayerID);
                }

            }
            else /// You loose
            {
                var opponentID = (playerID == "creator") ? "player2" : "creator";
                servMessage(s, 'danger', "Vous n'avez pas joué dans le temps imparti", 'broadcast');
                changeState(s, playerID, 'loose');
                changeState(s, opponentID, 'win');
            }
            stopCountdown(s, playerID);
            resetCountdown(s, playerID);
        }
    }, 1000)
}

function rematch(s){
    room[s.session.roomID].state = "transition";
    var otherPlayerID = (s.session.playerID == "creator") ? "player2" : "creator";
    delete room[s.session.roomID].players[otherPlayerID].hasJoined;
    delete room[s.session.roomID].players[s.session.playerID].hasJoined;
    delete room[s.session.roomID].validationCptr;
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

function servMessage(s, type, msg, broadcast) {
    if (broadcast == 'broadcast') {
        s.broadcast.to(s.session.roomID).emit('chatMessage', {
            from: 'server',
            type: type,
            msg: msg,
            date: Date.now
        });
        var opponentID = (s.session.playerID == "creator") ? "player2" : "creator";
        room[s.session.roomID].players[opponentID].messagesObjs.push({
            from: 'server',
            type: type,
            msg: msg,
            date: Date.now
        });
    } else {
        s.emit('chatMessage', {
            from: 'server',
            type: type,
            msg: msg,
            date: Date.now
        });
        room[s.session.roomID].players[s.session.playerID].messagesObjs.push({
            from: 'server',
            type: type,
            msg: msg,
            date: Date.now
        });
    }
}

module.exports = IO;
