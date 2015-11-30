var io;
var varRoom = [];

var IO = {
    set: function (IO) { // Cette fonction sera appelé dans le fichier app.js et valorisera la variable io
        io = IO;
        var $this = this; // On enregistre le contexte actuel dans une variable

        //on appelle cette function à chaque connection d'un nouvel utilisateur
        this.connection(function (socket) {
            // Toutes les fonctions que l'on va rajouter devront être ici
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
        io.on('connection', function (s) {
            // On envoie le nombre de personnes actuellement sur le socket à tout le monde (sauf la personne qui vient de se connecter)
            s.broadcast.emit('UserState', io.sockets.sockets.length);
            // On envoie le nombre de personnes actuellement sur le socket à la personne qui vient de se connecter
            s.emit('UserState', io.sockets.sockets.length);

            callback(s);
        });
    },
    disconnect: function (s) {
        if (s) {
            s.on('disconnect', function () {
                // On prévient tout le monde qu'une personne s'est deconnectée
                s.broadcast.emit('UserState', io.sockets.sockets.length);
            });
        }
    },
    adduser: function (s) {
        if (s) {
            s.on('adduser', function (name) {
                s.username = name;
                s.room = name + '01';
                s.join(name + '01');
            });
        }
    },
    TirClient: function (s) {
        s.on('TirClient', function (x, y) {
            var type;
            console.log("position tir : (" + x + ", " + y + ")");
            if (varRoom[s.room].Tab1[x][y]) {
                type = "touche";
            } else {
                type = "dansleau";
            }
            s.emit('TirServ', type, x, y);
            console.log("Name : " + s.username);
            console.log("Room : " + s.room);
            for (var k in varRoom)
                console.log(varRoom[k]);
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
                    s.emit('Message', k + ' non defini !');
                }
            }
            if (nbBat == 5) {
                varRoom[s.room] = {};
                varRoom[s.room].Tab1 = batPos;
                s.emit('PosBatValid');
                s.emit('Message', 'Positions des bateaux validées');
            }

            console.log(batPos);
        });
    }
};

module.exports = IO;