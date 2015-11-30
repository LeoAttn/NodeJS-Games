var express = require('express');
var session = require('express-session');

var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
//var sass = require('node-sass');
var sass = require('node-sass-middleware');
var mongoose = require('mongoose');

var routes = require('./app/routes/index');
var play = require('./app/routes/play');

var app = express();


// view engine setup
app.set('views', path.join(__dirname, 'app/views'));
app.set('view engine', 'jade');

app.use(favicon(path.join(__dirname, 'public/', 'favicon.png')));
app.use(session({
    secret: 'Insane Battle',
    resave: false,
    saveUninitialized:true
}));

app.use('/stylesheets', sass({
    src: __dirname + '/app/sass',
    dest: __dirname + '/public/stylesheets',
    debug: false,
    outputStyle: 'expanded'
}));

app.use(function(req, res, next){
    var name = req.session.name;
    if(!name)
    {
        name = req.session.name = "";
    }
    next();
});


app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', routes);
app.use('/play', play);

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

mongoose.connect('mongodb://localhost/NodeJS-Games', function(err) {
    if (err) { throw err; }
});

module.exports = app;
