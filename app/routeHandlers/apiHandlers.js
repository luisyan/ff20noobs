var logger = require('../util/logger').logger;
var leagueAPI = require('leagueapi');
var $q = require('q');
var myAPI = require('../lib/myAPI');
var DEFAULT = require('../constants/gameDefault');
var mongo = require('../db/db');
var events = require('events');
var event = new events.EventEmitter();
var ERR = require('../constants/general').ERR;
var runeFormatter = require('../util/rune').combineRunes;
leagueAPI.init(process.env.LOLKEY, 'na');
var fs = require('fs');
var getSummonerSpell = require('../util/summoner').getSummonerInfo;
var getChampion = require('../util/champion').getChampionInfo;
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
                })
                .then(function (data) {
                    console.log('Got on-going game of ['+pName+']');
                    filterDataBeforeReturn(data.data);
                    res.json(data);
                })
                .catch(function (err) {
                    logger.error(err);
                    next(err);
                });
        }
    };

    this.getRecentGames = function (req , res , next) {
        var pName = req.query.name,
            region = req.query.region,
            pId = req.query.id;

        if (!region) region = DEFAULT.REGION;

        event.on('getRecentGames.gotPlayerId', function(pId) {
            if (pName) {console.log('Got ID of ['+pName+']...calling riot API to get match list');}
            else {console.log('ID ['+pId+'] is given...calling riot API to get match list');}
            getRecentMatches(pId, region)
                .then(function (result) {
                    if (pName) {console.log('Got recent games of player ['+pName+']');}
                    else {console.log('Got recent games of player ['+pId+']');}
                    var analysedMatches = [];
                    for (var i in result) {
                        analysedMatches[i] = analyseMatch(pId , result[i]);
                    }
                    res.json(resSuccess(analysedMatches));
                })
                .catch(function (err) {
                    res.json(err);
                })
        });

        // event.emit must be positioned here after event.on is defined in case that id is given
        if (pId) {
            event.emit('getRecentGames.gotPlayerId', pId);
        } else {
            fnGetPlayer(pName , region).then(function (result) {
                event.emit('getRecentGames.gotPlayerId', result.id);
            }, function (err) {
                next(err);
            })
        }
    }


    this.handle404 = function (req, res, next) {
        logger.info(req.path);
        var err = new Error('Not Found, Invalid path');
        logger.error(err);
        err.status = 404;
        res.status(err.status);
        res.send({errCode: err.status, errorMsg: err.message, method: req.method, url: req.url});
    }
}


//------------------------------- functions -------------------------------------------

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

function filterDataBeforeReturn(game) {
    var players = game.participants;
    var orgnizedParticipants = {Blue: [], Purple: []};
    for (var i in players) {
        players[i].team = players[i].teamId == 100 ? 'Blue' : 'Purple';
        players[i].profileIcon = 'http://ddragon.leagueoflegends.com/cdn/'+require('../util/champion').championVersion+'/img/profileicon/'+players[i].profileIconId+'.png'
        players[i].champion = getChampion(players[i].championId);
        players[i].summonerSpell = {spell1: getSummonerSpell(players[i].spell1Id), spell2: getSummonerSpell(players[i].spell2Id)};
        players[i].formattedRunes = runeFormatter(runeLib, players[i].runes);

        delete players[i].teamId;
        delete players[i].profileIconId;
        // delete players[i].championId; // keep player id for frontend to get match list
        delete players[i].runes;
        delete players[i].spell1Id;
        delete players[i].spell2Id;
        //---- below is temporary ----
        delete players[i].summonerId;
        delete players[i].masteries;


        if (players[i].team == 'Blue') orgnizedParticipants.Blue.push(players[i]);
        else orgnizedParticipants.Purple.push(players[i]);
    }
    game.participants = orgnizedParticipants;
}

function getRecentMatches(pId, region) {
    var d = $q.defer();

    myAPI.myAPI_getRecentGames(pId, region, 0, 10)
        .then(function (result) {
            var matches = result.data;
            var fnList = [];
            for (var i in matches) {
                fnList[i] = myAPI.myAPI_getGame(matches[i].matchId, region);
            }
            $q.all(fnList).then(function (result) {
                d.resolve(result);
            })
        })
        .catch(function (err) {
            d.reject(err);
        })
    return d.promise;
}

function analyseMatch(pid, matchDetail) {
    var analysis = {},
        participantId,
        playerStats,
        itemUrlSuffix = 'http://ddragon.leagueoflegends.com/cdn/'+require('../util/champion').championVersion+'/img/item/';
    for (var i in matchDetail.participantIdentities) {
        if (pid == matchDetail.participantIdentities[i].player.summonerId) {
            participantId = matchDetail.participantIdentities[i].participantId;
        }
    }
    for (var i in matchDetail.participants) {
        if (matchDetail.participants[i].participantId == participantId) {
            playerStats = matchDetail.participants[i];
        }
    }

    analysis.isVictory = playerStats.stats.winner;
    analysis.champion = getChampion(playerStats.championId);
    analysis.kda = {
        kills: playerStats.stats.kills,
        deaths: playerStats.stats.deaths,
        assists: playerStats.stats.assists
    };
    analysis.summonerSpell = {spell1: getSummonerSpell(playerStats.spell1Id), spell2: getSummonerSpell(playerStats.spell2Id)};
    analysis.formattedRunes = runeFormatter(runeLib, playerStats.runes);
    analysis.minionsKilled = playerStats.stats.minionsKilled;
    analysis.items = [];
    if (playerStats.stats.item0 != 0) analysis.items.push({itemUrl: itemUrlSuffix + playerStats.stats.item0 + '.png'});
    if (playerStats.stats.item1 != 0) analysis.items.push({itemUrl: itemUrlSuffix + playerStats.stats.item1 + '.png'});
    if (playerStats.stats.item2 != 0) analysis.items.push({itemUrl: itemUrlSuffix + playerStats.stats.item2 + '.png'});
    if (playerStats.stats.item3 != 0) analysis.items.push({itemUrl: itemUrlSuffix + playerStats.stats.item3 + '.png'});
    if (playerStats.stats.item4 != 0) analysis.items.push({itemUrl: itemUrlSuffix + playerStats.stats.item4 + '.png'});
    if (playerStats.stats.item5 != 0) analysis.items.push({itemUrl: itemUrlSuffix + playerStats.stats.item5 + '.png'});
    if (playerStats.stats.item6 != 0) analysis.items.push({itemUrl: itemUrlSuffix + playerStats.stats.item6 + '.png'});

    return analysis;
}