// the main app for aaggreg backend
// by jm/lindat

var express = require('express');
var path = require('path');
var logger = require('morgan');

var debug = require('debug')('aaggreg');

var cors = require('cors');
var utils = require('./libs/utils');

var index_v1 = require('./routes/index_v1');
var version = require('./routes/version');
var got_v1 = require('./routes/got_v1');
//var attributes_v1 = require('./routes/attributes_v1');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.engine('html', require('ejs').renderFile);

// uncomment after placing your favicon in /public
//app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));

// app.use(body_parser.urlencoded({limit: '500mb', extended: true}));
// app.use(body_parser.json({limit: '500mb'}));
// app.use(body_parser.urlencoded({limit: '500mb', extended: true}));

app.use(cors());
app.use('/', index_v1);
app.use('/version', version);
app.use('/v1/got', got_v1);
//app.use('/v1/attributes', attributes_v1);

app.use(function(req, res, next) {
    var special_urls = ["/public", "/settings"];
    for (var i = 0; i < special_urls.length; ++i) {
        var special_url = special_urls[i];
        if (req.url.startsWith(special_url)) {
            req.url = req.url.substr(special_url.length);
            break;
        }
    }
    next();
});

app.use(express.static(path.join(__dirname, '..', 'public')));
app.use(express.static(path.join(__dirname, '..', 'settings')));

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});


// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});


app.set('port', process.env.PORT || 4001);

var server = app.listen(app.get('port'), function() {
  debug('Express server listening on port ' + server.address().port);
});

// set up repetitive tasks
var crons = require('./crons/cronjobs');
