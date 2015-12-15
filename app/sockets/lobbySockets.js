var IO = require('./sockets').room;

var lobbySockets = {
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
                else
                    s.broadcast.to(s.session.roomID).emit('ready', {});
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
            nb = parseInt(nb);
            if (nb >= 1 && nb <= 10) {
                room[s.session.roomID].nbBat = nb;
            }
        });
        s.on('changeTimeTimer', function (nb) {//Appelé lorsque l'on change le temps du timer via le formulaire
            nb = parseInt(nb);
            if (nb >= 10 && nb <= 600) {
                room[s.session.roomID].timeTimer = nb;
            }
        });
        s.on('startGame', function () {//Appelé lorsque l'on lance la partie (via le boutton Lancer la partie)
            room[s.session.roomID].state = "transition";
            s.emit('startGame');
            s.broadcast.to(s.session.roomID).emit('startGame', {});
        });
    }
}

module
