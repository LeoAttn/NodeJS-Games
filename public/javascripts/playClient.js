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
    var div;
    if(testMsg)
    {
        div = $('<div>',{
            id : msg,
            class : classes +' ' + classes+'-bg' + ' notifs' 
        }).appendTo('#msges');
        $('<p>', {
            text: msg
        }).appendTo(div);
    }
    
    var remove = function(){
        div.remove();
    };
    setTimeout(remove, 2000);

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
    socket.emit('batPos', batPos);
}

function clicTabAtt(x, y) {
    console.log("Le joueur a clique sur la case x=" + x + " et y=" + y + ".");
    //$(".cell-att").removeClass("cell-click");
    //$(".cell-att."+x+"-"+y).addClass("cell-click");
    socket.emit('tirClient', x, y);
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

// Gestion des Ã©vÃ¨nemment emit par le serveu

socket.on('batPosValid', function (session) {
    $(".bat").attr('draggable', 'false').css('cursor', 'default');
    $("#validBat").remove();
});

socket.on('tirServ', function (session, type, x, y) {
    if (type == "touche") {
        //$(".cell-def").removeClass("cell-touche");
        $(".cell-att." + x + "-" + y).addClass("cell-touche");
    } else if (type == "dansleau") {
        //$(".cell-def").removeClass("cell-aleau");
        $(".cell-att." + x + "-" + y).addClass("cell-dansleau");
    }
});

socket.on('newState', function (stateObj){
    switch(stateObj.state)
    {
        case 'wait':
            break;
        case 'myTurn':
            break;
    }
    socket.emit('updateState', stateObj.state);
});

socket.on('me', function (username)
{
    $("#myName").text(username);
});
          
socket.on('opponent', function (username){
    var text = $("#opponentName").text();
    if(text == '')
    {
        $("#opponentName").text(username);
        socket.emit('hello');
    }
});

socket.on('placeBoat', batTab)
{
    var nbBat =1;
    for (var y = 0; y < 10; y++)
    {
        for (var x = 0; x < 10; x++)
        {
            if(bat[x][y] ==1)
            {
                $('#id-'+ x + '-' + y).append($('#bat'+ nbBat))
                nbBat ++;
            }
        }
    }
}

socket.on('notifs', function (msgObj) {
    newMessage( msgObj.type, msgObj.msg);
});

socket.on('playerReady', function(){
    console.log("Oponent ready !");
});

socket.on('message', function (msg) {
    console.log(msg);
});

socket.on('hey', function(){
    socket.emit('joinGame', sess);
});

socket.on('uRturn', function(){

});
