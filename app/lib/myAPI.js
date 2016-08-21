/**
 * Created by Yan Liu on 2016-08-20.
 */
var leagueApiUtil = require('../../node_modules/leagueapi/lib/util');
var leagueAPI = require('leagueapi');
var logger = require('../util/logger').logger;
var $q = require('q');
var lolKey = process.env.LOLKEY;

module.exports = {
    getCurrentGame: function (pid, region) {
        var d = $q.defer();
        leagueAPI.getPlatformId(region).then(function (data) {
            var regionId = data;
            leagueApiUtil.makeRequest(craftCurrentGameUrl(pid, region, regionId), 'Error getting current game: ', null, function (err, data) {
                if (err) d.reject(err);
                else d.resolve(data);
            })
        });
        return d.promise;
    }
}

function craftCurrentGameUrl(pid, region, regionId) {
    return 'https://'+region+'.api.pvp.net' + '/observer-mode/rest/consumer/getSpectatorGameInfo' + '/' + regionId + '/' + pid + '?api_key=' + lolKey;
}