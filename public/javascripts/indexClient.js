//var socket = io.connect('http://localhost');
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
    $("thead").find("tr").remove();
    var trHead = $("<tr>").appendTo("thead");
    $("<th>", {
        class : "center",
        text : "Nom de la partie"
    }).appendTo(trHead);
    $("<th>", {
        class : "center",
        text : "Créateur"
    }).appendTo(trHead);
    $("<th>", {
        class : "center",
        text : "IsPlaying"
    }).appendTo(trHead);
    $("<th>", {
        class : "center",
        text : "IsPrivate"
    }).appendTo(trHead);
    $("<th>", {
        class : "center",
        text : "Rejoindre"
    }).appendTo(trHead);
    for(var k in rooms)
    {
        var tr = $('<tr>', {
            id: rooms[k]._id,
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
