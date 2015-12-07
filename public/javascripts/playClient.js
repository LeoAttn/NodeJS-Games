var clic = 0;
var socket = io.connect('http://localhost');
var play = io.connect('http://localhost/play'+ sess.roomID);


function newMessage(classes, msg) {
    var elem = $('.'+classes);
    var testMsg = true;
    //On vÃ©rifie qu'une div avec le meme message n'existe pas.
    $('.'+classes + ' p').each(function(){
        var text = $(this).html();
        if(text == msg)
            testMsg = false;
    });
    //On crÃ©er la div si un message identique n'existe pas.
    if(testMsg)
    {
        var div = $('<div>',{
            class : classes +' ' + classes+'-bg'
        }).appendTo('#msges');
        $('<p>', {
            text: msg
        }).appendTo(div);
    }

}

function cleanMessages(){
    console.log($('#msges').html);
    $('#msges').html = "";
}

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
    cleanMessages();
    socket.emit('BatPos', batPos);
}

function clicTabAtt(x, y) {
    console.log("Le joueur a clique sur la case x=" + x + " et y=" + y + ".");
    //$(".cell-att").removeClass("cell-click");
    //$(".cell-att."+x+"-"+y).addClass("cell-click");
    socket.emit('TirClient', x, y);
}

// Fonction pour gÃ©rer le drag n' drop
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

function copyclipboard(intext) {
    prompt(intext);
}

// Gestion des Ã©vÃ¨nemment emit par le serveur

socket.on('whoRU', function(){
    socket.emit('adduser', prompt("Quel est votre nom ?"));
});

socket.on('userCount', function (data) {
    $('.compt').text(data);
});

socket.on('PosBatValid', function (session) {
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

socket.on('errorMsg', function (msg) {
    newMessage('error', msg);
})

socket.on('info', function (msg) {
    newMessage('info', msg);
})

socket.on('playerReady', function(){
    console.log("Oponent ready !");
})

socket.on('Message', function (msg) {
    console.log(msg);
});

socket.on('handshake', function(){
    console.log(JSON.stringify(sess));
    socket.emit('join', sess);
});

socket.on('uRturn', function(){

});
