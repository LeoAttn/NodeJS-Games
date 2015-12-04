var clic = 0;
var socket = io.connect('http://localhost');

function testLog() {
    clic++;
    console.log("TEST - " + clic);
}

function clicButValid() {
    var batPos = {
        "Bat1": $('#Bat1').last().parent().prop('id'),
        "Bat2": $('#Bat2').last().parent().prop('id'),
        "Bat3": $('#Bat3').last().parent().prop('id'),
        "Bat4": $('#Bat4').last().parent().prop('id'),
        "Bat5": $('#Bat5').last().parent().prop('id')
    };
    socket.emit('BatPos', batPos);
}

function clicTabAtt(x, y) {
    console.log("Le joueur a clique sur la case x=" + x + " et y=" + y + ".");
    //$(".cell-att").removeClass("cell-click");
    //$(".cell-att."+x+"-"+y).addClass("cell-click");
    socket.emit('TirClient', x, y);
}

// Fonction pour gérer le drag n' drop
function allowDrop(ev) {
    ev.preventDefault();
}

function drag(ev) {
    ev.dataTransfer.setData("bateau", ev.target.id);
}

function drop(ev) {
    ev.preventDefault();
    var data = ev.dataTransfer.getData("bateau");
    ev.target.appendChild(document.getElementById(data));
}

// Gestion des évènemment emit par le serveur

function copyclipboard(intext) {
   prompt(intext);
}

socket.on('whoRU', function(){
    socket.emit('adduser', prompt("Quel est votre nom ?"));
});

socket.on('UserState', function (session, data) {
    $('.compt').text(data);
});

socket.on('PosBatValid', function (session) {
    $(".error p").each(function(){
        if($(this).html() == "Vous n'avez pas mis tous les bateaux !")
            $(this).parent().remove();
    })
    $(".bat").attr('draggable', 'false').css('cursor', 'default');
});

socket.on('TirServ', function (session, type, x, y) {
    if (type == "touche") {
        //$(".cell-def").removeClass("cell-touche");
        $(".cell-att." + x + "-" + y).addClass("cell-touche");
    } else if (type == "dansleau") {
        //$(".cell-def").removeClass("cell-aleau");
        $(".cell-att." + x + "-" + y).addClass("cell-dansleau");
    }
});

socket.on('errorMsg', function (session, msg) {
    //Créer une div erreur avec le message a l'interieur
    var elem = $('.error');
    var testMsg = true;
    //On vérifie qu'une div avec le meme message n'existe pas.
    $('.error p').each(function(){
        var text = $(this).html();
        if(text == msg)
            testMsg = false;
    })
    //On créer la div si un message identique n'existe pas.
    if(testMsg)
    {
        var div = $('<div>',{
            class : 'error error-bg'
        }).prependTo('body');
        $('<p>', {
            text: msg
        }).appendTo(div);
    }
})

socket.on('Message', function (session, msg) {
    console.log(msg);
});

socket.on('handshake', function(){
    console.log(JSON.stringify(sess));
    socket.emit('joinRoom', sess);
});
