var lastNbBat = 5;
var socket = io.connect('http://' + document.location.host);

$('#nbBat').change(function () {
    var nbBat = $('#nbBat').val();
    if (nbBat < 1 || nbBat > 10) {
        nbBat = lastNbBat;
    } else {
        if (nbBat != parseInt(nbBat)) {
            nbBat = parseInt(nbBat);
        }
        lastNbBat = nbBat;
    }
    $('#nbBat').val(nbBat);
    socket.emit('changeNbBat', nbBat);
});

function promptLink() {
    prompt("Lien :", document.location.host + "/join?roomID=" + sess.roomID);
}

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
    if (testMsg) {
        var div = $('<div>', {
            class: classes + ' ' + classes + '-bg'
        }).appendTo('#msges');
        $('<p>', {
            text: msg
        }).appendTo(div);
    }
}

function newUser(usernameJO, rank) {
    var username = usernameJO.username;
    var users = $('.user');
    var testMsg = true;
    //On vÃ©rifie qu'une div avec le meme message n'existe pas.
    $('.user' + ' p').each(function () {
        var text = $(this).html();
        if (text == username)
            testMsg = false;
    });
    //On crÃ©er la div si un message identique n'existe pas.
    if (testMsg) {
        var div = $('<li>', {
            class: 'user ' + rank + ' ' + rank + '-bg'
        }).appendTo('#playerList');
        $('<p>', {
            text: username
        }).appendTo(div);
    }
    return testMsg;
}

function unlockButton() {
    $('#startButton').removeAttr('disabled');
    $('#startButton').addClass('startButton');
}

function startGame() {
    $.ajax({
        type: 'put',
        url: '/api/set-ready/' + sess.roomID,
        data: "id=" + sess.roomID
    })
        .done(function (data) {
            socket.emit('startGame');
        })
        .fail(function (request, status, error) {
            console.log('ERROR !');
        })
}

function sendLogin() {
    var name = $('#loginName').val();
    console.log(name);
    if (name === undefined || name == null || name == "")
        name = 'Anonyme';
    sess.username = name;
    $('#loginName').val('');
    $('.loginLobby').remove();
    socket.emit('joinLobby', sess);
    if(sess.username != 'Anonyme')
        joinChat();
}

socket.on('hey', function () {
    socket.emit('joinLobby', sess);
    if(sess.username != 'Anonyme')
        joinChat();
});


socket.on('askUsername', function(){
    var div = $('<div>', {
        class: 'loginLobby'
    }).appendTo('body');
    $('<div>', {
        html: '<div class="form-group">' +
                '<div class="input-group">' +
                    '<input id="loginName" autofocus="autofocus" placeholder="Entrer votre nom" maxlength="20"  class="form-control input-lg"/>' +
                    '<div onClick="sendLogin()" class="input-group-addon btn btn-default">' +
                        '<span aria-hidden="true" class="glyphicon glyphicon-ok"></span>' +
                    '</div> </div> </div>'
    }).appendTo(div);
    $('#loginName').focus().keydown(function (event) {
        console.log(event);
        if (event.which == 13) sendLogin();
    });
})

socket.on('ready', function () {
    unlockButton();
});

socket.on('updateUsername', function(username){
    tmpUsername = sess.username;
    sess.username = username;
    if(tmpUsername == 'Anonyme')
        joinChat();
})

socket.on('addUser', function (usernameObj , rank) {
    var notExist = newUser(usernameObj, rank);
    if (usernameObj.bypass || notExist && usernameObj.username != sess.username && sess.username != "Anonyme") {
        socket.emit('sendUsername', sess.username);
    }
});

socket.on('startGame', function () {
    window.location.replace("http://" + document.location.host + "/play?id=" + sess.roomID);
});

socket.on('loadMessages', function (msgObjs) {
    for (msgObj in msgObjs) {
        var div = $('<tr>', {
            class: classes + ' ' + classes + '-bg'
        }).appendTo('#chatMessages table');
        $('<td>', {
            html: '<strong>' + msgObj.username + ' : </strong>' + msgObj.msg
        }).appendTo(div);
    }
});

socket.on('redirect', function (where) {
    window.location.replace("http://" + document.location.host + where);
})
