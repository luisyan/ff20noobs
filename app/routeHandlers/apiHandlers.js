var logger = require('../util/logger').logger;
var leagueAPI = require('leagueapi');
leagueAPI.init(process.env.LOLKEY, 'na');

module.exports =  function () {
    this.firstHandler = function (req, res, next) {
        logger.info( req.body )
        res.json( {msg : 'this is your msg:' + req.body.msg} );
    };

    this.getFeaturedGames = function (req , res, next) {
        leagueAPI.getFeaturedGames('na', function (err , data) {
            res.json(data);
        }, function (err) {
            logger.error(err);
            return next(err);
        });
    };

    this.getPlayerByName = function (req , res, next) {
        var name = req.query.name;
        leagueAPI.Summoner.getByName(name, function (err , data) {
            res.json(data);
        }, function (err) {
            logger.error(err);
            return next(err);
        });
    };
}