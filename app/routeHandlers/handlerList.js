var myModule = require('./apiHandlers' ),
    instance = new myModule();

module.exports = {
    firstRouteHandler: instance.firstHandler,
    featuredGame: instance.getFeaturedGames,
    playerByName: instance.getPlayerByName
}