var io;
var batPos = [[], [], [], [], [], [], [], [], [], []];

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
    TirClient: function (s) {
        s.on('TirClient', function (x, y) {
            var type;
            console.log("position tir : (" + x + ", " + y + ")");
            if (batPos[x][y]) {
                type = "touche";
            } else {
                type = "dansleau";
            }
            s.emit('TirServ', type, x, y)
        });
    },
    BatPos: function (s) {
        s.on('BatPos', function (pos) {
            console.log(pos);

            var bat = [];
            bat[0] = pos.Bat1.match(/[0-9]+/ig);
            bat[1] = pos.Bat2.match(/[0-9]+/ig);
            bat[2] = pos.Bat3.match(/[0-9]+/ig);
            bat[3] = pos.Bat4.match(/[0-9]+/ig);
            bat[4] = pos.Bat5.match(/[0-9]+/ig);

            for (var i=0; i<5; i++)
                batPos[parseInt(bat[i][0])][parseInt(bat[i][1])] = 1;

            console.log(batPos);
        });
    }
};

module.exports = IO;