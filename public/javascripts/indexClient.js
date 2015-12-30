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

function displayRoomList(rooms) {
    $("tbody").find("tr.room").remove();
    var mois = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'];

    for (var k in rooms) {
        var tr = $('<tr>', {
            id: rooms[k]._id,
            class: "room"
        }).appendTo('table');
        $('<td>', {
            text: rooms[k].name
        }).appendTo(tr);
        $('<td>', {
            text: rooms[k].creator
        }).appendTo(tr);
        $('<td>', {
            html: rooms[k].createdOn
        }).appendTo(tr);
        var td = $('<td>', {
            class: 'center'
        }).appendTo(tr);
        $('<button>', {
            class: 'btn btn-primary',
            name: 'id',
            value: rooms[k]._id,
            text: 'Rejoindre'
        }).appendTo(td);
    }
}

$(function () {
    setInterval(updateRoomList, 6000);
});
