/**
 * Created by Yan Liu on 2016-08-20.
 */
var bodyParser = require('body-parser');

module.exports =  function (app) {
    //check parameters before passing to handlers
    app.use( function ( req, res, next ) {
        console.log('[before every api call] %s %s %s', req.method, req.url, req.path );
        next();
    } );

    //parse parameters of post
    app.use( bodyParser.json() );
    app.use(bodyParser.urlencoded({
        extended: true
    }));

    //Cross region access
    app.use(function(req, res, next) {
        res.header('Access-Control-Allow-Origin', '*');
        res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
        next();
    });

}