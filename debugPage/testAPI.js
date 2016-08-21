$('document').ready(function(){
    $('button[testDiv]').click(function() {
        $.post( "/api/", {msg: 'ff 20'}, function( data ) {
            $( "div[debugResult]" ).text('This is msg from server: ' + JSON.stringify(data) );
        });
    });

    $('#btn_playerByName').click(function() {
        var url = "/api/player";
        $.get(url, {name: $('#ipt_playerByName').val()}, function( data ) {
            $( "div[debugResult]" ).html(JSON.stringify(data));
        });
    });
});