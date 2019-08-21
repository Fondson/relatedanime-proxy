var express = require('express');
var searchAnime = require('./searchAnime');
var pingSelf = require('./pingSelf');
var redis = require('./redisHelper');
var searchSeasonal = require('./searchSeasonal');
const path = require('path');

pingSelf.pingHomepage();
var app = express();

app.set('port', (process.env.PORT || 3002));

app.use(function(req, res, next) {
    res.header('Access-Control-Allow-Origin', 'http://www.relatedanime.com');
    res.header('Allow', 'http://www.relatedanime.com');
    res.header('Access-Control-Allow-Methods', 'POST, GET, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Referer, User-Agent');
    next();
});

async function _preCrawl(query) {
    try {
        // check redis
        let redisResult = await redis.get(query);
        if (redisResult !== null && redisResult !== undefined) {
            console.log(query + ' served from redis!')
            return redisResult;
        } 
    } catch (e) {
        console.log(e);
    }

    // couldn't find in redis
    return null;
}

app.get('/api/search/:searchStr', async function(req, res){
    const searchStr = req.params.searchStr;
    let count = 1;
    if (req.query.count > 1) {
        count = req.query.count;
    }

    let redisResult = await _preCrawl(searchStr);
    if (redisResult !== null) {
        res.end( JSON.stringify({ error: false, data: redisResult.slice(0, count)}) );
    } else {
        searchAnime(searchStr, res, count);
    }
});

app.get('/api/searchSeasonal', async function(req, res){
    let redisResult = await _preCrawl(searchSeasonal.SEASONAL_KEY);
    if (redisResult !== null) {
        res.end( JSON.stringify({ error: false, data: redisResult }) );
    } else {
        searchSeasonal.searchSeasonal(res);
    }
});

app.listen(app.get('port'), () => {
    console.log(`Find the server at: http://localhost:${app.get('port')}/`); // eslint-disable-line no-console
});
