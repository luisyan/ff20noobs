var logger = require('../util/logger').logger;
var leagueAPI = require('leagueapi');
var $q = require('q');
var myAPI = require('../lib/myAPI');
var DEFAULT = require('../constants/gameDefault');
var mongo = require('../db/db');
var runeFormatter = require('../util/rune').combineRunes;
leagueAPI.init(process.env.LOLKEY, 'na');
var fs = require('fs');
var runeLib = JSON.parse(fs.readFileSync('./app/staticData/rune.json', 'utf8'));

module.exports =  function () {
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
            return next(err);
        });
    };

    this.getPlayerByName = function (req , res, next) {
        var d = $q.defer(),
            p = d.promise;
        var name = req.query.name,
            region = req.query.region;
        if (!region) region = DEFAULT.REGION;

        if (!name) {
            res.json(resFail(null));
        } else {
            mongo.findPlayer(name).then(function (dbResult) {
                if (dbResult.length == 0) {
                    console.log('db doesn\'t contain this player, calling riot API...')
                    d.reject();
                } else {
                    d.resolve(dbResult);
                }
            }, function (err) {
                logger.error(err);
                return next(err);
            })
        }

        p.then(function (dbResult) {
            console.log('Got ['+dbResult.name+'] from db and returning');
            res.json(resSuccess(dbResult));
        }, function () {
            leagueAPI.Summoner.getByName(name, region)
                .then(function (data) {
                    for (var i in data) {
                        console.log('Got data from riot API:', data[i]);
                        mongo.insertOnePlayer(data[i])
                            .then(function () {
                                console.log('Inserted ['+ name +'] into db');
                                res.json(resSuccess(data[i]));
                            })
                    }
                }, function (err) {
                    logger.error(err);
                    return next(err);
                });
        })


    };

    this.getCurrentGame = function (req , res , next) {
        var pName = req.query.name,
            region = req.query.region;
        if (!region) region = DEFAULT.REGION;

        if (!pName) {
            res.json(resFail(null));
        } else {
            leagueAPI.Summoner.getByName(pName, region)
                .then(function (data) {
                    for (var i in data) {
                        var pid = data[i].id;
                    }
                    if (pid) console.log('got pid %s, getting current game', pid);
                    else {
                        logger.warn('got wrong pid', pid);
                        res.json(resFail(null));
                    }
                    myAPI.myAPIgetCurrentGame(pid, region)
                        .then(function (data) {
                            var runeArray = data.data.participants;
                            for (var i in runeArray) {
                                runeArray[i].formattedRunes = runeFormatter(runeLib, runeArray[i].runes);
                            }
                            res.json(data);
                        }, function (err) {
                            logger.error(err);
                            return next(err);
                        });
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
