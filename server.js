var express = require('express');
var searchAnime = require('./searchAnime');
var pingSelf = require('./pingSelf');
// var redis = require('./redisHelper');
const path = require('path');

pingSelf.pingHomepage();
var app = express();

app.set('port', (process.env.PORT || 3002));

app.use(function(req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Allow', '*');
    res.header('Access-Control-Allow-Methods', 'POST, GET, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Referer, User-Agent');
    next();
});

// async function _preCrawl(malType, malId, req=null) {
//     // check redis
//     let redisResult = await redis.getSeries(malType, malId);
//     if (redisResult !== null && redisResult !== undefined) {
//         console.log(malType + ' ' + malId + ' served from redis!')
//         return redisResult;
//     } 
//     // check db
//     let neo4jResult = await neo4j.getFromDbByMalTypeAndMalId(malType, malId, req);
//     if (neo4jResult !== null) {
//         // explicitly not using await
//         redis.setSeries(malType, malId, neo4jResult);
//         console.log(malType + ' ' + malId + ' served from neo4j!')
//         return neo4jResult;
//     }

//     // couldn't find in redis or neo4j
//     return null;
// }

app.get('/api/search/:searchStr', function(req, res){
    const searchStr = req.params.searchStr;
    let count = 1;
    if (req.query.count > 1) {
        count = req.query.count;
    }
    searchAnime(searchStr, res, count);
});

app.listen(app.get('port'), () => {
    console.log(`Find the server at: http://localhost:${app.get('port')}/`); // eslint-disable-line no-console
});
