/**
 * Created by Yan Liu on 2016-08-20.
 */
// var leagueApiUtil = require('../../node_modules/leagueapi/lib/util');
var leagueAPI = require('leagueapi');
var logger = require('../util/logger').logger;
var request = require('request');
var $q = require('q');
var lolKey = process.env.LOLKEY;

module.exports = {
    myAPIgetCurrentGame: function (pid, region) {
        var d = $q.defer();
        leagueAPI.getPlatformId(region).then(function (data) {
            var regionId = data;
            // leagueApiUtil.makeRequest(craftCurrentGameUrl(pid, region, regionId), 'Error getting current game: ', null, function (err, data) {
            //     console.log(err, err.statusCode, err.status);
            //     if (err) d.reject(err);
            //     else d.resolve(data);
            // })
            request(craftCurrentGameUrl(pid, region, regionId), function (err , response , body) {
                if (err) d.reject(body);
                else {
                    if (response.statusCode == 404) d.resolve(resFail(JSON.parse(body)));
                    else d.resolve(resSuccess(JSON.parse(body)));
                }
            })
        });
        return d.promise;
    }
}

function craftCurrentGameUrl(pid, region, regionId) {
    return 'https://'+region+'.api.pvp.net' + '/observer-mode/rest/consumer/getSpectatorGameInfo' + '/' + regionId + '/' + pid + '?api_key=' + lolKey;
}


function resSuccess(data) {
    return {resultCode: 0, data: data};
}
function resFail(data) {
    return {resultCode: 1, data: data};
}