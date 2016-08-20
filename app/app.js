var express = require('express');
var app = express();

var prefix = '/api';

app.set('port', process.env.PORT || 16000);

app.get(prefix + '/', function(req, res) {
    console.log('received req');
    res.json({msg: 'hello noobs'});
});


app.listen(app.get('port'), function(){
    console.log('ff20noobs server listening on port ' + app.get('port'));
});


