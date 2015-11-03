var clic = 0;

function testlog() {
    clic++;
    console.log("TEST");
    console.log(x);
}

function clictab(x, y) {
    console.log("Le joueur a clique sur la case x=" + x + " et y=" + y + ".");
    $(".cellule").css("background", "none");
    $("."+x+"-"+y).css("background", "red");
}