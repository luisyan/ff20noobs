var myModule = require('./apiHandlers' ),
    instance = new myModule();

module.exports = {
    firstRouteHandler: instance.firstHandler,
    featuredGame: instance.getFeaturedGames,
    playerByName: instance.getPlayerByName,
    err404: instance.handle404,
    onGoingGame: instance.getCurrentGame,
    recentGames: instance.getRecentGames
}