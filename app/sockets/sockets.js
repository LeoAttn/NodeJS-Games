var io;
var varRoom = [];
var roomID;
var isValid = false;
var IO = {
    set: function (IO) { // Cette fonction sera appelé dans le fichier app.js et valorisera la variable io
        io = IO;
        var $this = this; // On enregistre le contexte actuel dans une variable

        //on appelle cette function à chaque connection d'un nouvel utilisateur
        this.connection(function (socket) {

            // Toutes les fonctions que l'on va rajouter devront être ici
            $this.joinRoom(socket);
            $this.disconnect(socket);
            $this.TirClient(socket);
            $this.BatPos(socket);
            $this.adduser(socket);
        });
    },
    get: function () {
        return io;
    },
    connection: function (callback) {
        io.on('connection', function (socket) {
<<<<<<< e8927064e0d2eca03d6e072749af0087a60882b2
            if(!socket.request.session)
                socket.emit('whoRU');
=======
            console.log("Client Connected ");
            socket.emit('handshake');
>>>>>>> update session var between socket and http
            // On envoie le nombre de personnes actuellement sur le socket à tout le monde (sauf la personne qui vient de se connecter)
            socket.broadcast.emit('UserState', io.sockets.sockets.length);
            // On envoie le nombre de personnes actuellement sur le socket à la personne qui vient de se connecter
            socket.emit('UserState', socket.handshake.username, io.sockets.sockets.length);
            callback(socket);
        });
    },
    joinRoom: function(s){
        s.on('join', function(data){
            s.handshake.session = data;
            console.log("SESSION : " + s.handshake.session.username);
        })
    },
    disconnect: function (s) {
        s.on('disconnect', function () {
            s.leave();
            // On prévient tout le monde qu'une personne s'est deconnectée
            s.broadcast.emit('UserState', io.sockets.sockets.length);
        });
    },
    adduser: function (s) {
        if (s) {
            s.on('adduser', function (name) {
                s.handshake.session.username = name;
                s.handshake.session.roomId = name + '01';
                s.join(name + '01');
            });
        }
    },
    TirClient: function (s) {
        s.on('TirClient', function (x, y) {
            if(isValid)
            {
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

            var batPos = [[], [], [], [], [], [], [], [], [], []];
            for (var y = 0; y < 10; y++)
                for (var x = 0; x < 10; x++)
                    batPos[x][y] = 0;

            var bat, nbBat = 0;
            for (var k in pos) {
                if (bat = pos[k].match(/[0-9]+/ig)) {
                    batPos[parseInt(bat[0])][parseInt(bat[1])] = 1;
                    nbBat ++;
                } else {
                    s.emit('Message', s.handshake.username,  k + ' non defini !');
                }
            }
            if (nbBat == 5) {
                isValid = true;
                varRoom[s.room] = {};
                varRoom[s.room].Tab1 = batPos;
                s.emit('PosBatValid');
                s.emit('Message', s.handshake.username,  'Positions des bateaux validées');
            }
            else
                s.emit('errorMsg', s.handshake.username, "Vous n'avez pas mis tous les bateaux !");
            console.log(batPos);
        });
    }
};

module.exports = IO;
