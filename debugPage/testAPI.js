$('document').ready(function(){
    $('button[testDiv]').click(function() {
        $.post( "/api/", {msg: 'ff 20'}, function( data ) {
            $( "div[debugResult]" ).text('This is msg from server: ' + JSON.stringify(data) );
        });
    });
});