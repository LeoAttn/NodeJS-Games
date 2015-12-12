var NB_BAT;
var socket = io.connect('/');

//LOTO ...
function aQuiLeTour(state) { ///HAHAHA
    switch (state) {
        case 'myTurn':
            console.log("azerty");
            $('#aQuiLeTour').html("<strong>C'est à votre tour !</strong>")
                .addClass('success-bg')
                .removeClass('error-bg');
            $('.cell-att').addClass('pointer');
            break;

        case 'wait':
            $('#aQuiLeTour').html("<strong>C'est au tour de votre adversaire</strong>")
                .addClass('error-bg')
                .removeClass('success-bg');
            $('.cell-att').removeClass('pointer');
            break;

        default:
            $('#aQuiLeTour').html('')
                .removeClass('error-bg')
                .removeClass('success-bg');
            break;
    }
}

function clicButValid() {
    var batPos = {};
    for (var i = 1; i <= NB_BAT; i++) {
        batPos['Bat' + i] = $('#Bat' + i).last().parent().prop('id');
    }
    socket.emit('batPos', batPos);
}

function clicTabAtt(x, y) {
    console.log("Le joueur a clique sur la case x=" + x + " et y=" + y + ".");
    socket.emit('tirClient', x, y);
}

// Fonctions pour gÃ©rer le drag n' drop
function allowDrop(ev) {
    ev.preventDefault();
}

function drag(ev) {
    ev.dataTransfer.setData("bateau", ev.target.id);
}

function drop(ev) {
    ev.preventDefault();
    if(ev.target.childElementCount == 0 && ev.target.className != "bat")
    {
        var data = ev.dataTransfer.getData("bateau");
        ev.target.appendChild(document.getElementById(data));
        if($('.bat-container').is(':empty'))
        {
            $("#validBat").text("Valider les positions");
        }
    }
}

function displayEndGameButton()
{
    $('<button>', {
        class: 'btn btn-default',
        id: 'quitBtn',
        onClick: 'quitGame()',
        text: 'Quitter la partie'
    }).appendTo('#quitButton');
    $('<button>', {
        class: 'btn btn-default',
        id: 'rematchBtn',
        onClick: 'askRematch()',
        text: 'Rejouer'
    }).appendTo('#rematchButton');
}

function quitGame(){
    socket.emit("quitGame");
}

function askRematch(){
    socket.emit("askRematch");
    $("#rematchBtn").text("En attente ...");
}

function acceptRematch(){
    socket.emit("acceptRematch");
    $("#rematchButton").remove();
}

function refuseRematch(){
    socket.emit("refuseRematch");
    $("#rematchButton").remove();
}

// Gestion des Ã©vÃ¨nemment emit par le serveu

socket.on('countdown', function(countdown){
   $("#countdown").text(countdown);
});

socket.on('batPosValid', function () {

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
        case 'batPos':
            $('<button>', {
                class: 'btn btn-default',
                id: 'validBat',
                onClick: 'clicButValid()',
                text: 'Placer aléatoirement'
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
        case 'batPosValid':
            $(".bat").attr('draggable', 'false').css('cursor', 'default');
            $("#validBat").remove();
            break;
        case 'win':
            var div = $('<div>', {
                class: 'endParty',
                html: '<div class="win">Bravo, vous avez gagné !</div>'
            }).appendTo('body');
            $('.win').addClass('animation');
            setTimeout(function() {
                $('.win').addClass('win-anim');
            }, 700);
            displayEndGameButton();
            break;
        case 'loose':
            var div = $('<div>', {
                class: 'endParty',
                html: '<div class="loose">Vous avez perdu !</div>'
            }).appendTo('body');
            $('.loose').addClass('animation');
            setTimeout(function() {
                $('.loose').addClass('loose-anim');
            }, 700);
            displayEndGameButton();
            break;
    }
    aQuiLeTour(stateObj.state);
});

socket.on("askRematch", function (){
    $("#rematchBtn").remove();
    $("rematchButton").text($("#opponentName").text() + " veut rejouer")
    $('<button>', {
        class: 'btn btn-default',
        id: 'acceptRematch',
        onClick: 'acceptRematch()',
        text: 'Accepter'
    }).appendTo('#rematchButton');
    $('<button>', {
        class: 'btn btn-default',
        id: 'refuseRematch',
        onClick: 'refuseRematch()',
        text: 'Refuser'
    }).appendTo('#rematchButton');
});

socket.on("rematch", function(){
    $("#quitButton").remove();
    $("#rematchButton").remove();
    $("#endGame").addClass('endParty').text("La partie va démarrer !");
    socket.emit("rematch");
})

socket.on('me', function (username) {
    $("#myName").text(username);
});

socket.on('opponent', function (username) {
    $("#opponentName").text(username);
    socket.emit('hello');
});

socket.on('removeBoatContainer', function (){
    $(".bat-container").remove();
});

socket.on('placeBoat', function (batTab, tirTab) {
    var nbBat = 1;
    for (var y = 0; y < 10; y++) {
        for (var x = 0; x < 10; x++) {
            if (batTab[x][y] == 1 || batTab[x][y] == 2) {
                if($('#id-' +x + '-' + y).is(':empty'))
                {
                    $('<div>', {
                        id: "Bat" + nbBat,
                        class: "bat"
                    }).appendTo('#id-' + x + '-' + y);
                }
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
    window.location.replace(where);
});


socket.on('chatMessage', function (msgObj) {
    newChatMessage(msgObj);
});
