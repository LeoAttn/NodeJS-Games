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
        var div = $('<div>',{
            class : classes +' ' + classes+'-bg'
        }).appendTo('#chatMessages');
        $('<p>', {
            text: msgObj.username + ': ' +msgObj.msg
        }).appendTo(div);
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
    socket.emit('handshake', sess);
    console.log('Session : ', sess);
    console.log('username : ', sess.username);
    if(sess.username === undefined || sess.username == 'Anonyme')
        socket.emit('hey', prompt('Quel est votre pseudo ?'));
    else
        socket.emit('hey', sess.username);
});

socket.on('addUser', function(username, rank){
    var notExist = newUser(username, rank);
    if(notExist)
        socket.emit('hey');
});

socket.on('chatMessage', function(msgObj){
    newChatMessage(msgObj);
});

socket.on('startGame', function (){

});
