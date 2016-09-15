var DEFAULT = require('../constants/gameDefault').settings;
var myAPI = require('../lib/myAPI');
var jsonFile = require('jsonfile');
var events = require('events');
var verUpdateTimer = new events.EventEmitter();
var verInitEvent = new events.EventEmitter();
var request = require('requestretry');
var logger = require('../util/logger').updateVerLogger;
var $q = require('q');

var remoteItemVer, remoteProfileIconVer;

request('https://ddragon.leagueoflegends.com/realms/na.json', function (err , response , body) {
    var body = JSON.parse(body);
    if (err) console.error(err);
    else {
        remoteItemVer = body.n.item;
        remoteProfileIconVer = body.n.profileicon;

        verInitEvent.emit('updateItem&profileIcon', {item: remoteItemVer, profileIcon: remoteProfileIconVer});
    }
});

exports.getItemNprofileIconVer = function (callback) {
    verInitEvent.on('updateItem&profileIcon', function (data) {
        callback(data);
    })
}

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
            var fn1 = compareAndWrite(localChampionVer, remoteChampionVer, 'champion');
            var fn2 = compareAndWrite(localRuneVer, remoteRuneVer, 'rune');
            var fn3 = compareAndWrite(localSummonerVer, remoteSummonerVer, 'summoner');

            $q.all([fn1, fn2, fn3]).then(function (result) {
                var msg_match = '[MATCH]',
                    msg_not_match = '[NOT MATCH]';
                for (var i in result) {
                    if (result[i].match) msg_match = msg_match + result[i].type + ': ' + result[i].remoteVersion + ' | ';
                    else msg_not_match = msg_not_match + result[i].type + ': local ' + result[i].localVersion + ' remote ' + result[i].remoteVersion + ' | ';
                }
                if (msg_match == '[MATCH]') msg_match = '';
                if (msg_not_match == '[NOT MATCH]') msg_not_match = '';
                if (msg_match) logger.log(msg_match+'\t'+msg_not_match);
                else logger.log(msg_not_match);
            })

            function compareAndWrite(localVer, remoteVer, type) {
                var d = $q.defer();
                if (localVer == remoteVer) {
                    // logger.log('[MATCH]'+type+': %s', remoteVer);
                    d.resolve({match: true, type: type, remoteVersion: remoteVer})
                }
                else {
                    d.resolve({match: false, type: type, remoteVersion: remoteVer, localVersion: localVer})
                    // logger.log('updating local '+type+' json file...');
                    getStaticData(cdn+'/'+remoteVer+'/data/en_US/'+type+'.json ', function (data) {
                        jsonFile.writeFile('app/staticData/'+type+'.json', data, {spaces: 2}, function(err) {
                            if (err) console.error(err);
                            else logger.trace('updated '+type+' json file to %s', remoteVer);
                            switch (type) {
                                case 'champion':
                                    localChampionVer = remoteVer;
                                    break;
                                case 'rune':
                                    localRuneVer = remoteVer;
                                    break;
                                case 'summoner':
                                    localSummonerVer = remoteVer;
                                    break;
                                default:
                            }
                            verUpdateTimer.emit(type+'Updated');
                        })
                    })
                }
                return d.promise;
            }
        }
    })
},1000*60*30);

exports.event_updatedVer = function (type, callback) {
    verUpdateTimer.on(type+'Updated', function() {
        var msg = '[received '+type+'Updated event] going to re-require the '+type+' module';
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