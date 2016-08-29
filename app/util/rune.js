/**
 * Created by Yan Liu on 2016-08-24.
 */
exports.combineRunes = function (runeLib, playerRunes) {
    var playerRuneGroup = {};
    var calculatedRuneGroup = {};
    for (var i in playerRunes) {
        var runeId = playerRunes[i].runeId;
        if (playerRunes[i].rank) playerRunes[i].count = playerRunes[i].rank;
        var stats = runeLib.data[runeId].stats;
        playerRunes[i].description = runeLib.data[runeId].sanitizedDescription;;
        for (var j in stats) {
            playerRunes[i].statsNumber = runeLib.data[runeId].stats[j];
            if (!playerRuneGroup[j]) {
                playerRuneGroup[j] = [];
                playerRuneGroup[j].push(playerRunes[i]);
            } else {
                playerRuneGroup[j].push(playerRunes[i]);
            }
        }
    }
    for (var i in playerRuneGroup) {
        calculatedRuneGroup[i] = {
            finalNumber: 0
        }
        for (var j in playerRuneGroup[i]) {
            calculatedRuneGroup[i].finalNumber = calculatedRuneGroup[i].finalNumber + playerRuneGroup[i][j].count * playerRuneGroup[i][j].statsNumber;
        }
        var desc = playerRuneGroup[i][0].description;
        if (desc.indexOf('per level') != -1) {
            var ratio = computeRatio(desc);
        }

        if (desc.indexOf('%') != -1) {
            calculatedRuneGroup[i].finalNumber = (calculatedRuneGroup[i].finalNumber*100).toFixed(2);
            calculatedRuneGroup[i].description = calculatedRuneGroup[i].finalNumber + '%' + desc.substring(desc.indexOf(' '), desc.length);
        } else {
            calculatedRuneGroup[i].finalNumber = calculatedRuneGroup[i].finalNumber.toFixed(2);
            calculatedRuneGroup[i].description = calculatedRuneGroup[i].finalNumber + desc.substring(desc.indexOf(' '), desc.length);
        }
        if (calculatedRuneGroup[i].description.indexOf('per level') != -1 && ratio) {
            var fDesc = calculatedRuneGroup[i].description;
            var lvl18val = calculatedRuneGroup[i].finalNumber * ratio;
            if (fDesc.indexOf('+') != -1) {
                var lvl18string = fDesc.substring(fDesc.indexOf('(')+2, fDesc.indexOf(' at'));
            } else {
                var lvl18string = fDesc.substring(fDesc.indexOf('(')+1, fDesc.indexOf(' at'));
            }

            if (fDesc.indexOf('%') != -1) lvl18val = Number(lvl18val).toFixed(2) + '%';
            else lvl18val = Number(lvl18val).toFixed(2);

            calculatedRuneGroup[i].description = fDesc.replace(lvl18string, lvl18val);
        }
    }

    // console.log(calculatedRuneGroup);

    return calculatedRuneGroup;

    function computeRatio(desc) {
        var firstNum = desc.substring(0, desc.indexOf(' ')),
            secondNum = desc.substring(desc.indexOf('(')+1, desc.indexOf(' at'));
        if (firstNum.indexOf('%') != -1) firstNum = firstNum.slice(0,firstNum.length-1);
        if (secondNum.indexOf('%') != -1) secondNum = secondNum.slice(0,secondNum.length-1);
        return (secondNum/firstNum).toFixed(2);
    }
}
