/**
 * Created by Yan Liu on 2016-08-27.
 */
var fs = require('fs');
var summonerLib = JSON.parse(fs.readFileSync('./app/staticData/summoner.json', 'utf8'));
var version  = summonerLib.version,
    urlSuffix = 'http://ddragon.leagueoflegends.com/cdn/'+ version +'/img/spell/';

exports.summonerVersion = version;
exports.getSummonerInfo = function(spellId) {
    var summonerList = summonerLib.data;
    for (var i in summonerList) {
        if (spellId == summonerList[i].key) {
            return {
                name: summonerList[i].name,
                url: urlSuffix + summonerList[i].image.full
            }
        }
    }
}

var getSummonerEvent = require('../services/updateVersion').event_updatedVer;
getSummonerEvent('summoner', function () {
    summonerLib = require('../staticData/summoner.json');
    version  = summonerLib.version;
    urlSuffix = 'http://ddragon.leagueoflegends.com/cdn/'+ version +'/img/summoner/';
})