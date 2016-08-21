/**
 * Created by Yan Liu on 2016-08-20.
 */
var errorHandler = require('errorhandler'),
    logger = require('../util/logger').logger;

module.exports =  function (app) {
    app.use(function(err, req, res, next){
        logger.error(err);
        res.status(err.status || 500);
        err.message = 'Error message: '+err.message + ', url: '+ req.url + ', method: '+req.method;
        // res.send({errCode: err.status, errorMsg: err.message, method: req.method, url: req.url});
        next(err);
    });
    // app.use(errorHandler());
}