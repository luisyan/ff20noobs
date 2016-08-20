var hList = require('./routeHandlers/handlerList');
var URL_LIST = require('./constants/routesUrl');

module.exports = function (router) {
    router.route(URL_LIST.FIRST)
        .post(hList.firstRouteHandler);
}