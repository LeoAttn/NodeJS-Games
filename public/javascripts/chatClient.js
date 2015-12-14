
var chat = io.connect('/chat');
//var chat = io.connect('/');

$('#messageInput').keydown(function (event) {
    if (event.which == 13) sendMessage();
});

function sendMessage() {
    var msg = $('#messageInput').val();
    if (msg != '') {
        chat.emit('chatMessage', msg);
        $('#messageInput').val('');
    }
}

function newChatMessage(msgObj) {
    var classes = msgObj.from;
    var elem = $('.' + classes);
    var testMsg = true;
    //On crÃ©er la div si un message identique n'existe pas.
    if (testMsg) {
        if (msgObj.from == "server") {
            var div = $('<tr>', {
                class: classes + ' ' + classes + '-bg ' + msgObj.type
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
            var div = $('<tr>', {
                class: classes + ' ' + classes + '-bg'
            }).appendTo('#chatMessages table');
            $('<td>', {
                html: '<strong>' + $('<div/>').text(msgObj.username).html() + ' : </strong>' + $('<div/>').text(msgObj.msg).html()
            }).appendTo(div);
        }
        $('#chatMessages').animate({scrollTop: $('#chatMessages').prop('scrollHeight')}, 100);
    }
}

function joinChat(){
    chat.emit('joinChat', sess);
}

chat.on('chatMessage', function (msgObj) {
    newChatMessage(msgObj);
});

chat.on('loadMessages', function(msgObjs){
    console.log("HISTORIQUE : " + JSON.stringify(msgObjs));
    for (k in msgObjs) {
        console.log("MSG : " + JSON.stringify(k));
        newChatMessage(msgObjs[k]);
    }
});
