var request = require('request');
var cheerio = require('cheerio');
var redis = require('./redisHelper');

const MAL_TYPES = new Set(['anime', 'manga'])

function searchAnime(searchStr, res, count){
    scrapSearch(searchStr, res, count);
}

function scrapSearch(searchStr, res, count) {
    request("https://myanimelist.net/search/all?q=" + searchStr, function(error, response, body) {
        if(error) {
            console.log('searchAnime.js: ' + error)
            res.end(JSON.stringify({ error: true, why: error}));
            return;
        }
        // Check status code (200 is HTTP OK)
        if(response.statusCode === 200) {
            try {
                let $ = cheerio.load(body);

                const root = $('.content-result .content-left .js-scrollfix-bottom-rel');
                let headers = root.children('h2');
                let malType = '';
                let malEntries = null;
                // get the first header (either anime or manga)
                for (let i = 0; i < headers.length; ++i) {
                    const curType = $(headers[i]).attr('id');
                    // console.log(curType);
                    if (MAL_TYPES.has(curType)) {
                        malType = curType;
                        malEntries = $(headers[i]).next();
                        break;
                    }
                }

                // get the entries for the header
                let urlsAndNames = [];
                malEntries.find('.information .hoverinfo_trigger').slice(0, count).each(
                    (index, element) => urlsAndNames.push({name: $(element).text(), url: $(element).attr('href')})
                );
                
                let ret = []
                for (let i = 0; i < urlsAndNames.length; ++i) {
                    const url = urlsAndNames[i].url;
                    // get the malId
                    let pos = 0;
                    let slashCount = 0;
                    while (pos < url.length && slashCount < 4) {
                        if (url[pos++] == '/') {
                            slashCount += 1;
                        }
                    }
                    let id = ''
                    while (pos < url.length && url[pos] != '/') {
                        id += url[pos++];
                    }
                    ret.push({name: urlsAndNames[i].name, malType: malType, id: id});
                }
                console.log(urlsAndNames);
                if (ret.length >= 1) {
                    redis.set(searchStr, ret);
                }
                res.end( JSON.stringify({ error: false, data: ret}) );
            }
            catch (e) {
                console.log('searchAnime.js: ' + e)
                res.end(JSON.stringify({ error: true, why: 'No such anime.'}));
            }
        } else if (response.statusCode === 429) {  // too many requests error
            // try again
            scrapSearch(searchStr, res, count);
        } else {  // unhandled error
            console.log('searchAnime.js: status code ' + response.statusCode)
            res.end(JSON.stringify({ error: true, why: 'status code ' + response.statusCode}));
        }
    });
}

module.exports = searchAnime;