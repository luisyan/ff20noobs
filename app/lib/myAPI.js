/**
 * Created by Yan Liu on 2016-08-20.
 */
var leagueApiUtil = require('../../node_modules/leagueapi/lib/util');
var leagueAPI = require('leagueapi');
var logger = require('../util/logger').logger;
var request = require('requestretry');
var $q = require('q');
var lolKey = process.env.LOLKEY;
var CONSTANT = require('../constants/general');
// leagueApiUtil.setRateLimit(9 , 180000 );

module.exports = {
    myAPIgetCurrentGame: function (pid, region) {
        var d = $q.defer();
        leagueAPI.getPlatformId(region).then(function (data) {
            var regionId = data;
            request({
                url: craftCurrentGameUrl(pid, region, regionId),
                maxAttempts: CONSTANT.RIOT_API.MAX_ATTEMPTS,
                retryDelay: CONSTANT.RIOT_API.RETRY_DELAY,
                retryStrategy: retry429
            }, function (err , response , body) {
                if (err) d.reject(body);
                else {
                    if (response.statusCode == 404) d.resolve(resFail(JSON.parse(body)));
                    else d.resolve(resSuccess(JSON.parse(body)));
                }
            })
        });
        return d.promise;
    },
    myAPI_getRecentGames: function (pid , region, beginIndex, endIndex) {
        var d = $q.defer();

        request({
            url: craftRecentGameUrl(pid, region, beginIndex, endIndex),
            maxAttempts: CONSTANT.RIOT_API.MAX_ATTEMPTS,
            retryDelay: CONSTANT.RIOT_API.RETRY_DELAY,
            retryStrategy: retry429
        }, function (err , response , body) {
            if (err) d.reject(body);
            else {
                if (response.statusCode == 404) d.resolve(resFail(JSON.parse(body)));
                else d.resolve(resSuccess(JSON.parse(body).matches));
            }
        })
        return d.promise;
    },
    myAPI_getGame: function (mid , region) {
        var d = $q.defer();

        request({
            url: craftGameUrl(mid, region),
            maxAttempts: CONSTANT.RIOT_API.MAX_ATTEMPTS,
            retryDelay: CONSTANT.RIOT_API.RETRY_DELAY,
            retryStrategy: retry429
        }, function (err , response , body) {
            if (err) d.reject(body);
            else {
                if (response.statusCode == 404) d.resolve(resFail(JSON.parse(body)));
                else d.resolve(JSON.parse(body));
            }
        })

        return d.promise;
    },
}

function craftCurrentGameUrl(pid, region, regionId) {
    return 'https://'+region+'.api.pvp.net' + '/observer-mode/rest/consumer/getSpectatorGameInfo' + '/' + regionId + '/' + pid + '?api_key=' + lolKey;
}

function craftRecentGameUrl(pid, region, beginIndex, endIndex) {
    return 'https://'+region+'.api.pvp.net/api/lol/' + region + '/v2.2/matchlist/by-summoner/' + pid + '?rankedQueues=TEAM_BUILDER_DRAFT_RANKED_5x5&beginIndex='+beginIndex+'&endIndex='+endIndex+'&api_key=' + lolKey;
}

function craftGameUrl(mid, region) {
    return 'https://'+region+'.api.pvp.net/api/lol/' + region + '/v2.2/match/' + mid + '?includeTimeline=false'+'&api_key=' + lolKey;
}


function resSuccess(data) {
    return {resultCode: 0, data: data};
}
function resFail(data) {
    return {resultCode: 1, data: data};
}

function retry429(err, response, body){;
    var rateLimitCount = response.headers['x-rate-limit-count'],
        rateLimitType = response.headers['X-Rate-Limit-Type'],
        retryAfter = response.headers['Retry-After'];
    var notCausedByUser = !rateLimitType && !retryAfter;
    var tmpArray = rateLimitCount.split(/[:,]/g),
        limit_10_sec = Number(tmpArray[0]),
        limit_10_min = Number(tmpArray[2]);
    var overLimit_10sec = limit_10_sec > 2950;
    var overLimit_10min = limit_10_min > 170000;
    var tooMuchCalls = overLimit_10sec || overLimit_10min;

    console.log('attempts: %d\ttooMuchCalls: %s\tnotCausedByUser: %s\trequest:[10sec: %d] [10min: %d]',response.attempts, tooMuchCalls, notCausedByUser, limit_10_sec, limit_10_min);
    return (err || response.statusCode === 429) && !tooMuchCalls && notCausedByUser;
}
