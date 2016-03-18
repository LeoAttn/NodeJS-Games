var RoomsC = require('../controllers/Rooms'),
    UsersC = require('../controllers/Users');
    ScoresC = require('../controllers/HighScores');

var io,
    chat,
    room = [],
    timerFunction = [];

var IO = {
    set: function (IO) { // Cette fonction sera appelé dans le fichier app.js et valorisera la variable io
        io = IO;
        chat = io.of('/chat');
        var $this = this; // On enregistre le contexte actuel dans une variable
        //on appelle cette function à chaque connection d'un nouvel utilisateur
        this.connection(function (socket) {
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
        chat.on('connection', function (s) {
            console.log('CHAT CONNECTED !! ');
            s.emit('hey');
            callback(s);
        });
    },
    handshake: function (s) {
        s.on('hey', function (username) {
            if (username.length > 20)
                username = username.substr(0, 20);
            s.session.username = username;
            room[s.session.roomID].players[s.session.playerID].username = username;
            s.broadcast.to(s.session.roomID).emit('addUser', {
                username: s.session.username,
                avatar: s.session.avatarLink
            });
            s.emit('addUser', {
                username: s.session.username,
                avatar: s.session.avatarLink
            });
        });
    },
    lobby: function (s) {
        s.on('joinLobby', function (data) {//Appelé lorsque l'on rejoins le lobby au chargement de la page
            s.session = data;
            s.socketID = "lobby";
            if (room[s.session.roomID] === undefined) {
                room[s.session.roomID] = {};
                room[s.session.roomID].clients = 0;
                room[s.session.roomID].players = [];
                room[s.session.roomID].state = "lobby";
                room[s.session.roomID].nbBat = 5;
                room[s.session.roomID].timeTimer = 60;
            }
            if (room[s.session.roomID].clients < 2 && room[s.session.roomID].players[s.session.playerID] === undefined) {
                console.log("INIT LOBBY");
                initLobby(s);
            }
            else {
                if (room[s.session.roomID].clients < 2)
                    room[s.session.roomID].clients++;
                loadLobby(s);
            }
            if (room[s.session.roomID].clients == 2) {
                if (s.session.playerID == "creator")
                    s.emit('ready', {});
                else {
                    s.broadcast.to(s.session.roomID).emit('ready', {});
                    s.emit("updateNbBat", {nbBat: room[s.session.roomID].nbBat});
                    s.emit("updateTimeTimer", {time: room[s.session.roomID].timeTimer});
                }
            }
        });
        s.on('sendUsername', function (username) {//Appelé lors de l'envoi du pseudo au serveur
            s.emit("addUser", {
                username: s.session.username,
                avatar: s.session.avatarLink
            });
            s.broadcast.to(s.session.roomID).emit("addUser", {
                bypass: false,
                username: s.session.username,
                avatar: s.session.avatarLink
            });
        });
        s.on('changeNbBat', function (nb) {//Appelé lorsque l'on change le nombre de bateaux via le formulaire
            if (s.session.playerID == "creator") {
                nb = parseInt(nb);
                if (nb >= 1 && nb <= 10) {
                    room[s.session.roomID].nbBat = nb;
                    s.broadcast.to(s.session.roomID).emit("updateNbBat", {nbBat: nb});
                }
            }
        });
        s.on('changeTimeTimer', function (nb) {//Appelé lorsque l'on change le temps du timer via le formulaire
            if (s.session.playerID == "creator") {
                nb = parseInt(nb);
                if (nb >= 10 && nb <= 600) {
                    room[s.session.roomID].timeTimer = nb;
                    s.broadcast.to(s.session.roomID).emit("updateTimeTimer", {time: nb});
                }
            }
        });
        s.on('startGame', function () {//Appelé lorsque l'on lance la partie (via le boutton Lancer la partie)
            room[s.session.roomID].state = "transition";
            s.emit('startGame');
            s.broadcast.to(s.session.roomID).emit('startGame', {});
        });
    },
    chat: function (s) {
        s.on('joinChat', function (data) {//Appelé lorsque l'on rejoins le chat
            s.socketID = "chat";
            s.session = data;
            s.session.username = room[s.session.roomID].players[s.session.playerID].username;
            s.join(s.session.roomID);
            if (room[s.session.roomID].players[s.session.playerID].messagesObjs === undefined) {
                room[s.session.roomID].players[s.session.playerID].messagesObjs = [];
                servMessage(s, 'info', "Bienvenue dans la room !");
            } else {
                loadMessages(s);
            }
        });
        s.on('chatMessage', function (msag) {//Appelé lors de l'envoi d'un message
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
            if (room[s.session.roomID].players[opponentID] !== undefined &&
                room[s.session.roomID].players[opponentID].messagesObjs !== undefined) {
                room[s.session.roomID].players[opponentID].messagesObjs.push({
                    from: 'user',
                    msg: msag,
                    username: s.session.username,
                    date: Date.now
                });
            }

        });
    },
    game: function (s) {
        s.on('joinGame', function (data) {//Appelé en réponse au message hey, set la session et rejoins la room
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
            if (room[s.session.roomID].validationCptr === undefined)
                room[s.session.roomID].validationCptr = 0;
            if (room[s.session.roomID].players[s.session.playerID].hasJoined === undefined) {
                room[s.session.roomID].players[s.session.playerID].hasJoined = true;
                initGame(s);
            }
            else {
                if (room[s.session.roomID].clients < 2)
                    room[s.session.roomID].clients++;
                loadGame(s);
            }
        });
        s.on('batPos', function (pos) {//Appelé lorsque que l'on valide la position des bateaux (via le boutton Valider les position)
            console.log(pos);
            console.log('Room ID: ' + s.session.roomID);
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
                randomBoatPlacement(s, batPos, nbBat);
                servMessage(s, 'success', "La position des bateaux à été validée.");
                room[s.session.roomID].validationCptr += 1;
                checkPlayersAreReady(s);
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
                    room[s.session.roomID].nbLap++;
                    nextTurn(s, opponentID);
                    startCountdown(s, opponentID);

                    if (room[s.session.roomID].players[opponentID].batCoule == room[s.session.roomID].nbBat) {
                        stopCountdown(s, opponentID);
                        if (s.session.isAuthenticated === true) {
                            UsersC.addWin(s.session.username);
                            var time = new Date().getTime() - room[s.session.roomID].time;
                            ScoresC.create(s.session.username, room[s.session.roomID].nbLap, time);
                        }
                        changeState(s, s.session.playerID, 'win');
                        changeState(s, opponentID, 'loose');
                    }
                }
            }
        });
        s.on('hello', function () {//Appelé lorsque
            sendHello(s);
        });
        s.on('quitGame', function () {//Appelé lorsque l'on quitte la partie (via le boutton Quitter la partie)
            s.emit('redirect', '/flush-session');
            s.broadcast.to(s.session.roomID).emit('redirect', '/flush-session');
        });
        s.on('askRematch', function () {//Appelé lorsque l'on propose de rejouer
            changeState(s, s.session.playerID, 'askRematch');
            s.broadcast.to(s.session.roomID).emit('askRematch');
        });
        s.on('acceptRematch', function () {//Appelé lorsque l'on accepte de rejouer
            rematch(s);
            s.emit('rematch');
            s.broadcast.to(s.session.roomID).emit('rematch');
        });
        s.on('refuseRematch', function () {//Appelé lorsque que l'on refuse de rejouer
            s.emit('redirect', '/flush-session');
            s.broadcast.to(s.session.roomID).emit('redirect', '/flush-session');
        });
        s.on('rematch', function () {//Appelé lorsque l'on accepte de rejouer
            console.log(room[s.session.roomID].clients);
            if (room[s.session.roomID].clients == 2) {//Vérifie que les deux joueur sont toujours présents
                console.log("REMATCH! ");
                s.emit('redirect', '/play/' + s.session.roomID);
                s.broadcast.to(s.session.roomID).emit('redirect', '/play/' + s.session.roomID);
            }
            else {
                s.emit('redirect', '/flush-session');
            }
        });
        s.on('traiteCmd', function (msg) {
            if (room[s.session.roomID].state == 'lobby') {
                servMessage(s, 'warning', 'Les commandes ne fonctionnent pas dans le lobby !');
            } else {
                if (msg.substr(0, 1) == '/') {
                    switch (msg) {
                        case '/abandon':
                            var playerID = s.session.playerID;
                            var opponentID = (playerID == "creator") ? "player2" : "creator";
                            stopCountdown(s, playerID);
                            stopCountdown(s, opponentID);
                            if (room[s.session.roomID].players[opponentID].isAuthenticated == true)
                                UsersC.addWin(room[s.session.roomID].players[opponentID].username);
                            servMessage(s, 'warning', "Vous avez abandonné la partie.");
                            servMessage(s, 'info', "Votre adversaire a abandonné la partie.", 'broadcast');
                            changeState(s, playerID, 'loose');
                            changeState(s, opponentID, 'win');
                            break;
                        default :
                            servMessage(s, 'warning', 'La commande est invalide !');
                            break;
                    }
                }
            }
        });
    },
    disconnect: function (s) {
        s.on('disconnect', function () {//Appelé lors de la déconnexion d'un socket
            //Test la page ou est le socket et effectue l'action appropriée
            if (s.socketID == "chat") {
                if (room[s.session.roomID].state != "transition") {
                    s.broadcast.to(s.session.roomID).emit('chatMessage', {
                        from: 'server',
                        type: 'info',
                        msg: s.session.username + " à quitté la partie",
                        date: Date.now
                    });
                }
            }
            if (s.socketID == "lobby" || s.socketID == "game") {
                if ((room[s.session.roomID])) {
                    if (room[s.session.roomID].state != "transition" && room[s.session.roomID].state == s.socketID) {//Permet d'ignorer la destruction de la partie lors de la transition lobby -> game
                        room[s.session.roomID].clients--;
                        if (s.session.playerID == "creator" && s.socketID == "lobby") {
                            s.broadcast.to(s.session.roomID).emit('redirect', '/?error=OwnerQuit');
                        }
                        console.log("Clients : " + room[s.session.roomID].clients);
                        if (room[s.session.roomID].clients <= 0) {
                            RoomsC.delete(s.session.roomID);
                        }
                    }
                }
            }
            console.log("Client Disconnected");
        });
    }
};
/*===========================
    Chat functions
 ==============================*/
//Charge les messages lors que l'on passe d'une page à une autre
function loadMessages(s) {
    s.emit('loadMessages', room[s.session.roomID].players[s.session.playerID].messagesObjs);
}
/**===========================
    Lobby functions
 ==============================**/
//Initialise le lobby (lorsqu'un joueur rejoint pour la premiere fois une partie)
function initLobby(s) {
    var opponentID = (s.session.playerID == "creator") ? "player2" : "creator";
    if (s.session.username === undefined || s.session.username == '' || s.session.username == ' ' || s.session.username == null) {
        s.emit("askUsername");
    }
    else {
        room[s.session.roomID].players[s.session.playerID] = {
            username: s.session.username
        };
        s.emit("addUser", {username: s.session.username, avatar: s.session.avatarLink});
        s.broadcast.to(s.session.roomID).emit("addUser", {username: s.session.username, avatar: s.session.avatarLink});
        room[s.session.roomID].clients += 1;
        if (s.session.isAuthenticated == true) {
            room[s.session.roomID].players[s.session.playerID].isAuthenticated = true;
        }
    }
    s.join(s.session.roomID);
}
//Charge le lobby (lorsqu'un joueur a déja rejoint la partie mais recharge la page)
function loadLobby(s) {
    if (s.session.username == "Anonyme")
        s.emit("updateUsername", room[s.session.roomID].players[s.session.playerID].username);
    s.session.username = room[s.session.roomID].players[s.session.playerID].username;
    s.join(s.session.roomID);
    s.broadcast.to(s.session.roomID).emit('addUser', {
        bypass: true,
        username: s.session.username,
        avatar: s.session.avatarLink
    });
    s.emit('addUser', {bypass: false, username: s.session.username, avatar: s.session.avatarLink});
    if (room[s.session.roomID].clients == 2) {
        if (s.session.playerID == "creator")
            s.emit('ready', {});
        else
            s.broadcast.to(s.session.roomID).emit('ready', {});
    }
}
/*===========================
    Game functions
 ==============================*/
//Envoi les pseudos lorsque la partie commence
function sendHello(s) {
    s.emit('me', s.session.username);
    s.broadcast.to(s.session.roomID).emit('opponent', s.session.username);
}
//Initialise la partie lorsque le joueur rejoint pour la premiere fois
function initGame(s) {
    sendHello(s);
    room[s.session.roomID].players[s.session.playerID].state = "";
    changeState(s, s.session.playerID, 'batPos');
    room[s.session.roomID].players[s.session.playerID].batTab = [[], [], [], [], [], [], [], [], [], []];
    resetCountdown(s, s.session.playerID);
    launchCheckTimeUp(s, s.session.playerID);
    startCountdown(s, s.session.playerID);
    setTimeout(function () {
        servMessage(s, 'info', "Entrez \"/abandon\" pour abandonné à tout moment.");
        servMessage(s, 'info', "Veuillez placer les bateaux sur votre plateau.");

    }, 200);
}
//Charge la partie si un joueur à déja rejoint et qu'il recharge la page
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
    launchCheckTimeUp(s, s.session.playerID);
    s.emit('updateState', {state: stateP});
    s.emit('placeBoat', batTab, tirTab);
    sendHello(s);
}
//Change le tour
function nextTurn(s, opponentID) {
    changeState(s, s.session.playerID, 'wait');
    changeState(s, opponentID, 'myTurn');
}
//Arrete le compte à rebours
function stopCountdown(s, playerID) {
    clearInterval(timerFunction[playerID]);
    //s.emit("countdown", "x");
}
//Reset le compte à rebours
function resetCountdown(s, playerID) {
    room[s.session.roomID].players[playerID].timer = room[s.session.roomID].timeTimer;
    room[s.session.roomID].players[playerID].timesUp = false;
}
//Démarre le compte à rebours sur le serveur
function startCountdown(s, playerID) {
    console.log("Started Countdown for " + playerID + "(" + room[s.session.roomID].players[playerID].username + ")");
    if(timerFunction[playerID] !== undefined)
        clearInterval(timerFunction[playerID]);
    timerFunction[playerID] = setInterval(function () {
        console.log(room[s.session.roomID].players[playerID].timer)
        room[s.session.roomID].players[playerID].timer--;
        if (room[s.session.roomID].players[playerID].timer <= 0) {
            room[s.session.roomID].players[playerID].timesUp = true;
        }
    }, 1000);
}
//Démare une fonction appellé a interval de 1 sec, (lié au socket) pour vérifier si le temps est écoulé
function launchCheckTimeUp(s, playerID) {
    if (room[s.session.roomID].players[playerID].timerFunction !== undefined)
        clearInterval(room[s.session.roomID].players[playerID].timerFunction);
    room[s.session.roomID].players[playerID].timerFunction = setInterval(function () {
        if (room[s.session.roomID].players[playerID].timesUp == false)
            if (playerID == s.session.playerID)
                s.emit('countdown', room[s.session.roomID].players[playerID].timer);
            else
                s.broadcast.to(s.session.roomID).emit('countdown', room[s.session.roomID].players[playerID].timer);
        else {
			stopCountdown(s, playerID);
            resetCountdown(s, playerID);
            if (playerID == s.session.playerID)
                s.emit('notifs', {type: 'info', msg: "Temps Ecoulé"});
            else
                s.broadcast.to(s.session.roomID).emit('info', {type: 'info', msg: "Temps Ecoulé"})

            if (room[s.session.roomID].players[playerID].state == "batPos") {
                s.emit('cleanTab');
                var batPos = [[], [], [], [], [], [], [], [], [], []];
                var nbBat = 0;
                randomBoatPlacement(s, batPos, nbBat);
                servMessage(s, 'warning', "La position des bateaux à été choisi aléatoirement car vous avez depassé le temps imparti.");
                room[s.session.roomID].validationCptr += 1;
                checkPlayersAreReady(s);
            }
            else {
                var opponentID = (playerID == "creator") ? "player2" : "creator";
                servMessage(s, 'danger', "Vous n'avez pas joué dans le temps imparti");
                changeState(s, playerID, 'loose');
                changeState(s, opponentID, 'win');
            }
        }
    }, 1000)
}
//Place aléatoirement les bateaux
function randomBoatPlacement(s, batPos, nbBat) {
    if (nbBat != room[s.session.roomID].nbBat) {
        while (nbBat != room[s.session.roomID].nbBat) {
            var randX = Math.floor(Math.random() * 9);
            var randY = Math.floor(Math.random() * 9);
            if (batPos[randX][randY] != 1) {
                batPos[randX][randY] = 1;
                nbBat++;
            }
        }
        var tirTab = [[], [], [], [], [], [], [], [], [], []];
        for (var x = 0; x < 10; x++) {
            for (var y = 0; y < 10; y++) {
                tirTab[x][y] = 0;
            }
        }
    }
    s.emit('removeBoatContainer');
    s.emit('placeBoat', batPos, tirTab);
    changeState(s, s.session.playerID, 'batPosValid');
    stopCountdown(s, s.session.playerID);
    resetCountdown(s, s.session.playerID);
    room[s.session.roomID].players[s.session.playerID].batTab = batPos;
    room[s.session.roomID].players[s.session.playerID].batCoule = 0;
}
//Vérifie que les joueurs sont pret, (que leur bateaux ont été validé)
function checkPlayersAreReady(s) {
    if (room[s.session.roomID].validationCptr == 2) {
		console.log("LET'S START ! ");
        s.broadcast.emit('start');
        s.emit('start');
        var rand = Math.round(Math.random());
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
		console.log("FIRST PLAYER : "+ firstPlayerID);
		console.log("SECOND PLAYER : "+ secondPlayerID);
        room[s.session.roomID].nbLap = 0;
        room[s.session.roomID].time = new Date().getTime();
        startCountdown(s, firstPlayerID);

    }
    else {
        servMessage(s, 'info', "Veuillez attendre que votre adversaire place ses bateaux.");
        servMessage(s, 'info', "Votre adversaire est prêt !", 'broadcast');
    }
}
//Prépare la partie pour rejouer
function rematch(s) {
    room[s.session.roomID].state = "transition";
    var otherPlayerID = (s.session.playerID == "creator") ? "player2" : "creator";
    delete room[s.session.roomID].players[otherPlayerID].hasJoined;
    delete room[s.session.roomID].players[s.session.playerID].hasJoined;
    delete room[s.session.roomID].validationCptr;
}
//Nettoie la room
function cleanRoom(s) {
    delete room[s.session.roomID];
}
//Change l'état d'un joueur et met à jour l'état coté client
function changeState(s, playerID, newState) {
    room[s.session.roomID].players[playerID].state = newState;
    if (playerID == s.session.playerID) {
        s.emit('updateState', {state: newState});
    }
    else {
        s.broadcast.to(s.session.roomID).emit('updateState', {state: newState});
    }

}
//Envoi un message chat via le serveur
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
