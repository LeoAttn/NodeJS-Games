var lastNbBat = 5;
var socket = io.connect('http://localhost');

$('#messageInput').keydown(function(event){
    console.log(event);
    if (event.which == 13) sendMessage();
});

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
    prompt("Lien :", "localhost/join?roomID="+sess.roomID);
}

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

function newChatMessage(msgObj) {
    var classes = msgObj.from;
    var elem = $('.'+classes);
    var testMsg = true;
    //On crÃ©er la div si un message identique n'existe pas.
    if(testMsg)
    {
        if (msgObj.from == "server") {
            var div = $('<tr>',{
                class : classes +' ' + classes+'-bg ' + msgObj.type
            }).appendTo('#chatMessages table');
            if (msgObj.name) {
                $('<td>', {
                    html: '<strong>' + msgObj.name + ' : </strong>' + msgObj.msg
                }).appendTo(div);
            } else {
                $('<td>', {
                    html: msgObj.msg
                }).appendTo(div);
            }
        } else {
            var div = $('<tr>',{
                class : classes +' ' + classes+'-bg'
            }).appendTo('#chatMessages table');
            $('<td>', {
                html: '<strong>' + msgObj.username + ' : </strong>' +msgObj.msg
            }).appendTo(div);
        }
        $('#chatMessages').animate({scrollTop : $('#chatMessages').prop('scrollHeight')}, 50);
    }

}

function newUser(usernameJO, rank)
{
    var username = usernameJO.username;
    var users = $('.user');
    var testMsg = true;
    //On vÃ©rifie qu'une div avec le meme message n'existe pas.
    $('.user' + ' p').each(function(){
        var text = $(this).html();
        if(text == username)
            testMsg = false;
    });
    //On crÃ©er la div si un message identique n'existe pas.
    if(testMsg)
    {
        var div = $('<li>',{
            class : 'user ' + rank +' ' + rank+'-bg'
        }).appendTo('#playerList');
        $('<p>', {
            text: username
        }).appendTo(div);
    }
    return testMsg;
}

function unlockButton(){
	$('#startButton').removeAttr('disabled');
}

function startGame(){
    $.ajax({
        type: 'put',
        url: '/api/lobby/set-ready/'+ sess.roomID,
        data : "id="+sess.roomID
    })
    .done(function(data) {
        socket.emit('startGame');
    })
    .fail(function(request,status,error) {
        console.log('ERROR !');
    })
}

function sendMessage(){
    var msg = $('#messageInput').val();
    console.log(msg);
    if(msg != '')
    {
        socket.emit('chatMessage', msg);
        $('#messageInput').val('');
    }
}

function sendLogin(){
    var name = $('#loginName').val();
    console.log(name);
    if(name === undefined || name == null || name == "")
        name = 'Anonyme';
    sess.username = name;
    socket.emit('hey', sess.username);
    $('#loginName').val('');
    $('.loginLobby').remove();
}

socket.on('hey', function (){
    socket.emit('joinLobby', sess);
    if(sess.username === undefined || sess.username == 'Anonyme')
	{
        var div = $('<div>',{
            class : 'loginLobby'
        }).appendTo('body');
        $('<div>', {
            html: '<div class="form-group"> <div class="input-group"> <input id="loginName" autofocus="autofocus" placeholder="Entrer votre nom" maxlength="20"  class="form-control input-lg"/> <div onClick="sendLogin()" class="input-group-addon btn btn-default"><span aria-hidden="true" class="glyphicon glyphicon-ok"></span></div> </div> </div>'
        }).appendTo(div);
        $('#loginName').focus().keydown(function(event){
            console.log(event);
            if (event.which == 13) sendLogin();
        });
	} else
	    socket.emit('hey', sess.username);
});

socket.on('ready', function(){
	unlockButton();
});

socket.on('addUser', function(username, rank){
    var notExist = newUser(username, rank);
    if(notExist && username != sess.username)
	{
		socket.emit('hey', sess.username);
	}
});

socket.on('chatMessage', function(msgObj){
    newChatMessage(msgObj);
});

socket.on('startGame', function (){
    window.location.replace("http://localhost/play?id="+sess.roomID);
});

socket.on('loadMessages', function(msgObjs){
    for(msgObj in msgObjs)
    {
        var div = $('<tr>',{
                class : classes +' ' + classes+'-bg'
        }).appendTo('#chatMessages table');
        $('<td>', {
            html: '<strong>' + msgObj.username + ' : </strong>' +msgObj.msg
        }).appendTo(div);
    }
});

socket.on('redirect', function(where){
    window.location.replace("http://localhost"+ where);
})
