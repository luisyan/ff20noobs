/**
 * Created by Yan Liu on 2016-08-27.
 */
var fs = require('fs');
var championLib = JSON.parse(fs.readFileSync('./app/staticData/champion.json', 'utf8'));
var version  = championLib.version,
    urlSuffix = 'http://ddragon.leagueoflegends.com/cdn/'+ version +'/img/champion/';

exports.getChampionInfo = function(championId) {
    var championList = championLib.data;
    for (var i in championList) {
        if (championId == championList[i].key) {
            return {
                name: championList[i].name,
                url: urlSuffix + championList[i].image.full
            }
        }
    }
}

exports.championVersion = version;