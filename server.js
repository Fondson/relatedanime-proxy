var express = require('express');
var proxy = require('express-http-proxy');
var pingSelf = require('./pingSelf');

pingSelf.ping();
var app = express();

app.set('port', (process.env.PORT || 3002));

app.use(function(req, res, next) {
    res.header('Access-Control-Allow-Origin', 'http://www.relatedanime.com');
    res.header('Allow', 'http://www.relatedanime.com');
    res.header('Access-Control-Allow-Methods', 'POST, GET, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Referer, User-Agent');
    next();
});
 
app.use('/proxy', proxy('www.myanimelist.net'));

app.listen(app.get('port'), () => {
    console.log(`Find the server at: http://localhost:${app.get('port')}/`); // eslint-disable-line no-console
});
