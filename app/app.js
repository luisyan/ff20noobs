'use strict';
var express = require('express'),
    consign = require('consign');

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
app.listen(app.get('port'), function(){
    console.log('Server is listening on port ' + app.get('port'));
});