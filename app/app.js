'use strict';
var express = require('express');

var getRoutes = require('./routeIndex'),
    errHandling = require('./services/errorHandlers'),
    generalService = require('./services/general'),
    PORT = require('./constants/general').PORT;

var app = express();
var router = express.Router();


generalService(app, router); //general services
getRoutes(router); //actual api calls handling
errHandling(app); //error handling

app.set('port', PORT);
app.listen(app.get('port'), function(){
    console.log('Server is listening on port ' + app.get('port'));
});