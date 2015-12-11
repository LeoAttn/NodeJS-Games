var NB_BAT;
var clic = 0;
var socket = io.connect('http://' + document.location.host);

function newMessage(classes, msg) {
    var elem = $('.' + classes);
    var testMsg = true;
    //On vÃ©rifie qu'une div avec le meme message n'existe pas.
    $('.' + classes + ' p').each(function () {
        var text = $(this).html();
        if (text == msg)
            testMsg = false;
    });
    //On crÃ©er la div si un message identique n'existe pas.
    var div;
    if (testMsg) {
        div = $('<div>', {
            id: msg,
            class: classes + ' ' + classes + '-bg' + ' notifs'
        }).appendTo('#msges');
        $('<p>', {
            text: msg
        }).appendTo(div);
    }

    var remove = function () {
        div.remove();
    };
    setTimeout(remove, 2000);

}

function cleanMessages() {
    console.log($('#msges').html);
    $('#msges').html = "";
}

function testLog() {
    clic++;
    console.log("TEST - " + clic);
}

function clicButValid() {
    /*var batPos = {
     "Bat1": $('#Bat1').last().parent().prop('id'),
     "Bat2": $('#Bat2').last().parent().prop('id'),
     "Bat3": $('#Bat3').last().parent().prop('id'),
     "Bat4": $('#Bat4').last().parent().prop('id'),
     "Bat5": $('#Bat5').last().parent().prop('id')
     };*/
    var batPos = {};
    for (var i = 1; i <= NB_BAT; i++) {
        batPos['Bat' + i] = $('#Bat' + i).last().parent().prop('id');
    }
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

// Gestion des Ã©vÃ¨nemment emit par le serveu

socket.on('countdown', function(countdown){
   $("#countdown").text(countdown);
});

socket.on('batPosValid', function () {
    $(".bat").attr('draggable', 'false').css('cursor', 'default');
    $("#validBat").remove();
});

socket.on('tirServ', function (obj) {
    var tab = obj.tab;
    var type = obj.type;
    var x = obj.x;
    var y = obj.y;
    $(".cell-" + tab + "." + x + "-" + y).addClass("cell-" + type);
});

socket.on('updateState', function (stateObj) {
    switch (stateObj.state) {
        case 'wait':
            $('.cell-att').removeClass('pointer');
            break;
        case 'myTurn':
            $('.cell-att').addClass('pointer');
            break;
        case 'batPos':
            $('<button>', {
                class: 'btn btn-default',
                id: 'validBat',
                onClick: 'clicButValid()',
                text: 'Valider les positions'
            }).appendTo('#validationButton');
            for (var x = 1; x <= NB_BAT; x++) {
                $('<div>', {
                    id: "Bat" + x,
                    class: "bat",
                    draggable: true,
                    ondragstart: "drag(event)"
                }).appendTo('.bat-container')
            }
            break;
    }
});

socket.on('me', function (username) {
    $("#myName").text(username);
});

socket.on('opponent', function (username) {
    $("#opponentName").text(username);
    socket.emit('hello');
});

socket.on('placeBoat', function (batTab, tirTab) {
    var nbBat = 1;
    for (var y = 0; y < 10; y++) {
        for (var x = 0; x < 10; x++) {
            if (batTab[x][y] == 1 || batTab[x][y] == 2) {
                $('<div>', {
                    id: "Bat" + nbBat,
                    class: "bat"
                }).appendTo('#id-' + x + '-' + y);
                nbBat++;
            }
            if (batTab[x][y] == 2) {
                $('.cell-def.' + x + '-' + y).addClass("cell-touche");
            } else if (batTab[x][y] == 3) {
                $('.cell-def.' + x + '-' + y).addClass("cell-dansleau");
            }
            if (tirTab[x][y] == 2) {
                $('.cell-att.' + x + '-' + y).addClass("cell-touche");
            } else if (tirTab[x][y] == 3) {
                $('.cell-att.' + x + '-' + y).addClass("cell-dansleau");
            }
        }
    }
});

socket.on('notifs', function (msgObj) {
    newMessage(msgObj.type, msgObj.msg);
});

socket.on('playerReady', function () {
    console.log("Oponent ready !");
});

socket.on('message', function (msg) {
    console.log(msg);
});

socket.on('hey', function () {
    console.log('test');
    socket.emit('joinGame', sess);
    joinChat();
});

socket.on('nbBat', function (nbBat) {
    NB_BAT = nbBat;
});

socket.on('uRturn', function () {

});

socket.on('redirect', function (where) {
    window.location.replace("http://" + document.location.host + where);
});
