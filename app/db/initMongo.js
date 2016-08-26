/**
 * Created by Yan Liu on 2016-08-21.
 */
var MongoClient = require('mongodb').MongoClient;
var dbName = 'ff20';
var dbUrl = 'mongodb://localhost:27017/' + dbName;
var events = require('events');
var event = new events.EventEmitter();
var _db;

module.exports = {
    initMongo: function (callback) {
        MongoClient.connect( dbUrl , function (err , db) {
            if ( err ) return err;
            _db = db;
            event.emit('mongoConnected');
            callback( err , dbName );
        } )
    },
    getDB: function (fn) {
        if (_db) {
            console.log('[before waiting for conect event] got _db and going to do db operation');
            fn(_db);
        }
        else {
            console.log('[_db is undefined] waiting for connected event...');
            event.on('mongoConnected', function() {
                console.log('[received connect event] got _db and going to do db operation');
                fn(_db);
            });
        }
    }
}
