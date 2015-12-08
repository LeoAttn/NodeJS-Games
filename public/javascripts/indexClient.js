//var socket = io.connect('http://localhost');

$(function(){
    setInterval(updateRoomList, 6000);
});

function updateRoomList()
{
    $.ajax({
        type: 'get',
        url: '/api/'
    })
    .done(function(data) {

    })
    .fail(function(request,status,error) {
        console.log('ERROR !');
    })
}
