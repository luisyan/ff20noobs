/**
 * Created by Yan Liu on 2016-08-21.
 */
var mongo = require('./initMongo');
var logger = require('../util/logger').logger;
var $q = require('q');
var ERR = require('../constants/general').ERR;
var playerCollection;

mongo.getDB(function (db) {
    playerCollection = db.collection('player');
})

module.exports = {
    findPlayer: function (name) {
        var d = $q.defer();
        playerCollection.find({name: {$regex: name, $options: 'i'}}).limit(1).toArray(function (err , result) {
            if (err) d.reject({errType: ERR.DB_QUERY_ERR, error: err});
            else d.resolve(result);
        })
        return d.promise;
    },
    insertOnePlayer: function (playerObj) {
        var d = $q.defer();
        playerCollection.insertOne(playerObj, function (err , result) {
            if (err) d.reject(err);
            else {
                if (result.insertedCount == 1) d.resolve();
            }

        })
        return d.promise;
    }

}