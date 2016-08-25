/**
 * Created by Yan Liu on 2016-08-21.
 */
var MongoClient = require('mongodb').MongoClient;
var dbName = 'ff20';
var dbUrl = 'mongodb://localhost:27017/' + dbName;

module.exports.initMongo = function (callback) {
    MongoClient.connect(dbUrl, function(err, db) {
        module.exports.db = db;
        if (err) console.log(err);
        else {
            module.exports.db = db;
            callback(err, dbName);
        }
    });
}
