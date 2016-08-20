$('document').ready(function(){
    $('button[testDiv]').click(function() {
        var r = Math.random();
        $.get( "/api/", function( data ) {
            $( "div[debugResult]" ).html( JSON.stringify(data) );
        });
    });
});