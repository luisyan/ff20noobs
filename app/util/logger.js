
exports.logger = require('tracer').colorConsole({
    format : "{{timestamp}} <{{title}}> {{message}} ({{file}}:{{line}})",
    dateformat : "HH:MM:ss"
});

exports.updateVerLogger = require('tracer').colorConsole({
    format : "{{timestamp}} <{{title}}> {{message}}",
    dateformat : "[yyyy-mm-dd]HH:MM"
});