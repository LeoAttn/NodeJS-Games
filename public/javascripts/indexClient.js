//var socket = io.connect('http://localhost');
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

$(function() {
    setInterval(updateRoomList, 6000);
});
