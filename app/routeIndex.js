var handler = require('./routeHandlers/handlerList');
var URL_LIST = require('./constants/routesUrl');

module.exports = function (router) {
    router.route(URL_LIST.FIRST)
        .post(handler.firstRouteHandler);

    router.route(URL_LIST.FEATURED)
        .get(handler.featuredGame);

    router.route(URL_LIST.PLAYER)
        .get(handler.playerByName);

    router.route(URL_LIST.ON_GOING_GAME)
        .get(handler.onGoingGame);

    router.route(URL_LIST.recentGames)
        .get(handler.recentGames);







    // router.route(URL_LIST.ERR404)
    //     .all(handler.err404);

}