var clic = 0;
var socket = io.connect('http://localhost');

function testlog() {
    clic++;
    console.log("TEST - " + clic);
}

function clictab(x, y) {
    console.log("Le joueur a clique sur la case x=" + x + " et y=" + y + ".");
    $(".cell").removeClass("cell-click");
    $("."+x+"-"+y).addClass("cell-click");
    socket.emit('tir', x, y);
}

socket.on('UserState', function (data) {
    $('.compt').text(data);
});

