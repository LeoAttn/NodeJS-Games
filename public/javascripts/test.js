var clic = 0;

function testlog() {
    clic++;
    console.log("TEST - " + clic);
}

function clictab(x, y) {
    console.log("Le joueur a clique sur la case x=" + x + " et y=" + y + ".");
    $(".cell").removeClass("cell-click");
    $("."+x+"-"+y).addClass("cell-click");
}

var socket = io.connect('http://localhost');

socket.on('UserState', function (data) {
    $('.compt').text(data);
});