'use strict';
var express = require('express'),
    consign = require('consign'),
    db = require('./db/initMongo');

var app = express();
var router = express.Router();

var PORT = require('./constants/general').PORT;

consign({cwd: 'app'})
    .include('routeIndex.js')
    .into(router)
    .include('services/general.js')
    .then('services/errorHandlers.js')
    .into(app);


app.use('/api', router);
app.set('port', PORT);

db.initMongo(function (err, dbName) {
    if (err) {
        console.log('Failed to connect to db, exiting');
        process.exit(1);
    }
    else {
        console.log("Succesfully connected to db ["+dbName+"]" );
        app.listen(app.get('port'), function(){
            console.log('Server is listening on port ' + app.get('port'));
        });
    }
});