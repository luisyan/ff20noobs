var logger = require('../util/logger').logger;
module.exports = {
    firstHandler : function (req, res) {
        logger.info( req.body )
        res.json( {msg : 'this is your msg:' + req.body.msg} );
    }
}