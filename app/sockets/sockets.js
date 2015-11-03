var io; 

var IO = {
    set: function (IO) { // Cette fonction sera appelé dans le fichier app.js et valorisera la variable io
        io = IO;
        var $this = this; // On enregistre le contexte actuel dans une variable

        //on appelle cette function à chaque connection d'un nouvel utilisateur
        this.connection(function (socket) {
          // Toutes les fonctions que l'on va rajouter devront être ici
            $this.disconnect(socket);
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
    }
};

module.exports = IO;