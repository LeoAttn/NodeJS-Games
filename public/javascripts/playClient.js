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

    $(".bat").attr('draggable', 'false')
             .css('cursor', 'default');
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

socket.on('connect', function() {
    socket.emit('adduser', prompt("What's your name?"));
});

socket.on('UserState', function (data) {
    $('.compt').text(data);
});

socket.on('TirServ', function (type, x, y) {
    if (type == "touche") {
        //$(".cell-def").removeClass("cell-touche");
        $(".cell-att." + x + "-" + y).addClass("cell-touche");
    } else if (type == "dansleau") {
        //$(".cell-def").removeClass("cell-aleau");
        $(".cell-att." + x + "-" + y).addClass("cell-dansleau");
    }
});

socket.on('Message', function (msg) {
    console.log(msg);
});

