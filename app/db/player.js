/**
 * Created by Yan Liu on 2016-08-21.
 */
var mongo = require('./initMongo');
var logger = require('../util/logger').logger;
var db = mongo.db;
var $q = require('q');

var playerCollection = db.collection('player');

insertDocuments(db).then(function (data) {
    logger.trace(data);
}, function (err) {
    logger.error(err);
})

module.exports = {

}

function insertDocuments(db) {
    var d = $q.defer();
    var collection = db.collection('documents');
    collection.insertMany([
        {a : 1}, {a : 2}, {a : 3}
    ], function(err, result) {
        if (err) d.reject(err);
        else {
            console.log("Inserted 3 documents into the collection");
            d.resolve(result);
        }
    });
    return d.promise;
}