var logger = require('../util/logger').logger;
var leagueAPI = require('leagueapi');
var $q = require('q');
var myAPI = require('../lib/myAPI');
var DEFAULT = require('../constants/gameDefault');
var mongo = require('../db/db');
var ERR = require('../constants/general').ERR;
var runeFormatter = require('../util/rune').combineRunes;
leagueAPI.init(process.env.LOLKEY, 'na');
var fs = require('fs');
var runeLib = JSON.parse(fs.readFileSync('./app/staticData/rune.json', 'utf8'));

module.exports =  function () {
    var self = this;
    this.firstHandler = function (req, res, next) {
        logger.info( req.body )
        res.json( {msg : 'this is your msg:' + req.body.msg} );
    };

    this.getFeaturedGames = function (req , res, next) {
        leagueAPI.getFeaturedGames('na')
            .then(function (data) {
            res.json(resSuccess(data));
        }, function (err) {
            logger.error(err);
            next(err);
        });
    };

    this.getPlayerByName = function (req , res, next) {
        var name = req.query.name,
            region = req.query.region;
        if (!region) region = DEFAULT.REGION;

        if (!name) {
            res.json(resFail(null));
        } else {
            fnGetPlayer(name , region).then(function (result) {
                res.json(resSuccess(result));
            }, function (err) {
                next(err);
            })
        }




    };

    this.getCurrentGame = function (req , res , next) {
        var pName = req.query.name,
            region = req.query.region;
        if (!region) region = DEFAULT.REGION;

        if (!pName) {
            res.json(resFail(null));
        } else {
            fnGetPlayer(pName, region)
                .then(function (result) {
                    var pid = result.id;
                    if (!pid) {
                        logger.warn('got wrong pid', pid);
                        res.json(resFail(null));
                    } else return myAPI.myAPIgetCurrentGame(pid, region);
            }, function (err) {
                next(err);
            })
                .then(function (data) {
                    console.log('Got on-going game of ['+pName+']');
                    var runeArray = data.data.participants;
                    for (var i in runeArray) {
                        runeArray[i].formattedRunes = runeFormatter(runeLib, runeArray[i].runes);
                    }
                    res.json(data);
                }, function (err) {
                    logger.error(err);
                    return next(err);
                });
        }
    };

    this.handle404 = function (req , res , next) {
        logger.info(req.path);
        var err = new Error('Not Found, Invalid path');
        logger.error(err);
        err.status = 404;
        res.status(err.status);
        res.send({errCode: err.status, errorMsg: err.message, method: req.method, url: req.url});
    }
}

function resSuccess(data) {
    return {resultCode: 0, data: data};
}
function resFail(data) {
    return {resultCode: 1, data: data};
}


function fnGetPlayer(name, region) {
    var d = $q.defer();
    mongo.findPlayer(name).then(function (dbResult) {
        if (dbResult.length != 0) {
            return dbResult[0];
        } else {
            console.log('db doesn\'t have ['+name+']');
            process.stdout.write('Calling riot API...')
            return {errType: ERR.DB_EMPTY_FIND};
        }
    }).then(function (dbResult) {
        if (dbResult.hasOwnProperty('errType')) {
            if (dbResult.errType == ERR.DB_EMPTY_FIND) return leagueAPI.Summoner.getByName(name, region);
        } else {
            console.log('Got ['+dbResult.name+'] from db');
            d.resolve(dbResult);
        }
    }).then(function (data) {
        for (var i in data) {
            console.log('Got ['+data[i].name+'] from riot API');
            mongo.insertOnePlayer(data[i])
                .then(function () {
                    console.log('Inserted ['+ name +'] into db');
                    d.resolve(data[i]);
                })
        }
    }).catch(function (err) {
        if (err.errType == ERR.DB_QUERY_ERR) {
            logger.error(err);
            console.log('[db error] getting player data from db failed');
            process.stdout.write('Calling riot API...');
        } else throw err;
    }).catch(function (err) {
        logger.error(err);
        d.reject(err);
    })
    return d.promise;
}