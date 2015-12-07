var socket = io.connect('http://localhost');

$('#messageInput').keydown(function(event){
    if (event.which == 13)
    {
        sendMessage();
    }
})

function newMessage(classes, msg) {
    var elem = $('.'+classes);
    var testMsg = true;
    //On vÃ©rifie qu'une div avec le meme message n'existe pas.
    $('.'+classes + ' p').each(function(){
        var text = $(this).html();
        if(text == msg)
            testMsg = false;
    })
    //On crÃ©er la div si un message identique n'existe pas.
    if(testMsg)
    {
        var div = $('<li>',{
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
        } else {
            var div = $('<tr>',{
                class : classes +' ' + classes+'-bg'
            }).appendTo('#chatMessages table');
        }

        $('<td>', {
            html: '<strong>' + msgObj.username + ' : </strong>' +msgObj.msg
        }).appendTo(div);
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
    })
    //On crÃ©er la div si un message identique n'existe pas.
    if(testMsg)
    {
        var div = $('<div>',{
            class : 'user ' + rank +' ' + rank+'-bg'
        }).appendTo('#playerList');
        $('<p>', {
            text: username
        }).appendTo(div);
    }
    return testMsg;
}

function unlockButton(){
	$('#startButton').disabled = false;
}

function startGame(){
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



socket.on('hey', function (){
    socket.emit('joinLobby', sess);
    if(sess.username === undefined || sess.username == 'Anonyme')
	{
		socket.emit('hey', prompt('Quel est votre pseudo ?'));
	}
    else
	{
		socket.emit('hey', sess.username);
	}
});

socket.on('ready', function(){
	unlockButton();
});

socket.on('addUser', function(username, rank){
    var notExist = newUser(username, rank);
    if(notExist)
	{
		socket.emit('hey', sess.username);
	}
});

socket.on('chatMessage', function(msgObj){
	console.log(msgObj);
    newChatMessage(msgObj);
});

socket.on('startGame', function (){

});
