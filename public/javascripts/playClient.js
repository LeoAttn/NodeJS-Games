var clic = 0;
var socket = io.connect('http://localhost');

function testlog() {
    clic++;
    console.log("TEST - " + clic);
}

function clicTabAtt(x, y) {
    console.log("Le joueur a clique sur la case x=" + x + " et y=" + y + ".");
    $(".cell-att").removeClass("cell-click");
    $(".cell-att."+x+"-"+y).addClass("cell-click");
    socket.emit('TirClient', x, y);
}

socket.on('UserState', function (data) {
    $('.compt').text(data);
});

socket.on('TirServ', function (x, y) {
    $(".cell-def").removeClass("cell-click");
    $(".cell-def."+x+"-"+y).addClass("cell-click");
});



