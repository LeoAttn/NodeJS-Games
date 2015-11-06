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
        "Bat3": $('#Bat3').last().parent().prop('id')
    };
    /*console.log($('#Bat1').last().parent().prop('id'));
    var batPos = {
        "Bat1": "1-1",
        "Bat2": "4-8",
        "Bat3": "6-2"
    };*/
    socket.emit('BatPos', batPos);
}

function clicTabAtt(x, y) {
    console.log("Le joueur a clique sur la case x=" + x + " et y=" + y + ".");
    //$(".cell-att").removeClass("cell-click");
    //$(".cell-att."+x+"-"+y).addClass("cell-click");
    socket.emit('TirClient', x, y);
}

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



