
exports.logger = require('tracer').colorConsole({
    format : "{{timestamp}} <{{title}}> {{message}} ({{file}}:{{line}})",
    dateformat : "HH:MM:ss"
});