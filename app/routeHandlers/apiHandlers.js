var logger = require('../util/logger').logger;
var leagueAPI = require('leagueapi');
var myAPI = require('../lib/myAPI');
var DEFAULT = require('../constants/gameDefault');
leagueAPI.init(process.env.LOLKEY, 'na');

module.exports =  function () {
    this.firstHandler = function (req, res, next) {
        logger.info( req.body )
        res.json( {msg : 'this is your msg:' + req.body.msg} );
    };

    this.getFeaturedGames = function (req , res, next) {
        leagueAPI.getFeaturedGames('na')
            .then(function (data) {
            res.json(data);
        }, function (err) {
            logger.error(err);
            return next(err);
        });
    };

    this.getPlayerByName = function (req , res, next) {
        var name = req.query.name,
            region = req.query.region;
        if (!region) region = DEFAULT.REGION;

        leagueAPI.Summoner.getByName(name, region)
            .then(function (data) {
                for (var i in data) {
                    res.json(data[i]);
                }
        }, function (err) {
            logger.error(err);
            return next(err);
        });
    };

    this.getCurrentGame = function (req , res , next) {
        var pName = req.query.name,
            region = req.query.region;
        if (!region) region = DEFAULT.REGION;

        leagueAPI.Summoner.getByName(pName, region)
            .then(function (data) {
                for (var i in data) {
                    var pid = data[i].id;
                }
                myAPI.getCurrentGame(pid, region)
                    .then(function (data) {
                    res.json(data);
                }, function (err) {
                    logger.error(err);
                    return next(err);
                });
            }, function (err) {
                logger.error(err);
                return next(err);
            });
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


