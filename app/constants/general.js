/**
 * Created by Yan Liu on 2016-08-20.
 */
module.exports = {
    PORT: 16000,
    ERR: {
        DB_QUERY_ERR: 1001,
        DB_EMPTY_FIND: 1002
    },
    RATE_LIMIT: {
        TEN_SEC: 3000,
        TEN_MIN: 180000
    },
    RIOT_API: {
        MAX_ATTEMPTS: 10,
        RETRY_DELAY: 1000
    }
}