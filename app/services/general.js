/**
 * Created by Yan Liu on 2016-08-20.
 */
var bodyParser = require('body-parser');

module.exports =  function (app, router) {
    //add /api to all requested url
    app.use('/api', router);
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

    //check parameters before passing to handlers
    router.use( function ( req, res, next ) {
        console.log('[before every api call] %s %s %s', req.method, req.url, req.path );
        console.log('[query: %s params: %s]', req.query.name, req.params.name)
        next();
    } );

}