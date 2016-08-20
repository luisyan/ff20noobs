'use strict';

var express = require('express');
var bodyParser = require('body-parser');

var app = express();
var router = express.Router();
var getRoutes = require('./routeIndex');

app.use(function(req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    next();
});

app.use( bodyParser.json() );
app.use(bodyParser.urlencoded({
    extended: true
}));
app.set('port', process.env.PORT || 16000);

getRoutes(router);

app.use('/api', router);

app.listen(app.get('port'), function(){
    console.log('ff20 server is listening on port ' + app.get('port'));
});


