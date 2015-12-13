function updateRoomList() {
    $.ajax({
        type: 'get',
        url: '/api/'
    })
        .done(function (data) {
            console.log(data);
            displayRoomList(data);
        })
        .fail(function (request, status, error) {
            console.log('ERROR !');
        })
}

function displayRoomList(rooms)
{
    $("tbody").find("tr.room").remove();
    $("thead").find("tr.room").remove();
    for(var k in rooms)
    {
        var tr = $('<tr>', {
            id: rooms[k]._id,
            class : "room"
        }).appendTo('thead');
        $('<td>',{
            text : rooms[k].name
        }).appendTo(tr);
        $('<td>',{
            text : rooms[k].creator
        }).appendTo(tr);
        $('<td>',{
            text : rooms[k].playing
        }).appendTo(tr);
        $('<td>',{
            text : rooms[k].private
        }).appendTo(tr);
        var td = $('<td>',{
            class : 'center'
        }).appendTo(tr);
        $('<button>', {
            class : 'btn btn-primary',
            name : 'id',
            value : rooms[k]._id,
            text : 'Rejoindre'
        }).appendTo(td);
    }
}

$(function () {
    setInterval(updateRoomList, 6000);
});
