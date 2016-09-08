var DEFAULT = require('../constants/gameDefault').settings;
var myAPI = require('../lib/myAPI');
var jsonFile = require('jsonfile');
var events = require('events');
var event = new events.EventEmitter();
var request = require('requestretry');

setInterval(function () {
    request('https://ddragon.leagueoflegends.com/realms/na.json', function (err , response , body) {
        var body = JSON.parse(body);
        var remoteVer = body.v,
            cdn = body.cdn,
            remoteChampionVer = body.n.champion,
            remoteRuneVer = body.n.rune,
            remoteSummonerVer = body.n.summoner,
            remoteItemVer = body.n.item,
            remoteProfileIconVer = body.n.profileicon;
        if (err) console.error(err);
        else {
            compareAndWrite(localChampionVer, remoteChampionVer, 'champion');
            compareAndWrite(localRuneVer, remoteRuneVer, 'rune');
            compareAndWrite(localSummonerVer, remoteSummonerVer, 'summoner');

            function compareAndWrite(localVer, remoteVer, type) {
                if (localVer == remoteVer) console.log('local '+type+' version is %s, same as server version %s', localVer, remoteVer);
                else {
                    console.log('updating local '+type+' json file...');
                    getStaticData(cdn+'/'+remoteVer+'/data/en_US/'+type+'.json ', function (data) {
                        jsonFile.writeFile('app/staticData/'+type+'.json', data, {spaces: 2}, function(err) {
                            if (err) console.error(err);
                            else console.log('updated '+type+' json file to %s', remoteVer);
                            localVer = remoteVer;
                            event.emit(type+'Updated');
                        })
                    })
                }
            }

        }
    })
},1000*60*30);

exports.event_updatedVer = function (type, callback) {
    event.on(type+'Updated', function() {
        console.log('[received '+type+'Updated event] going to re-require the '+type+' module');
        callback();
    });
}

var localChampionVer = require('../util/champion').championVersion;
var localRuneVer = require('../util/rune').runeVersion;
var localSummonerVer = require('../util/summoner').summonerVersion;


function getStaticData(url, callback) {
    request(url, function (err , response , body) {
        if (err) console.log(err);
        else callback(JSON.parse(body));
    })
}