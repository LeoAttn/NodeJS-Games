var express = require('express');
var session = require('express-session');

var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var sass = require('node-sass-middleware');
var mongoose = require('mongoose');

var routes = require('./app/routes/index');
var play = require('./app/routes/play');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'app/views'));
app.set('view engine', 'jade');
// init morgan logger
app.use(logger('dev'));
//Initialise le middleware cookie parser
app.use(cookieParser("secret"));
//Initialise le middleware de session
app.use(session({
    secret: 'secret',
    resave: false,
    saveUninitialized:true
}));

//Lie le css avec le module sass
app.use('/stylesheets', sass({
    src: __dirname + '/app/sass',
    dest: __dirname + '/public/stylesheets',
    debug: false,
    outputStyle: 'compressed'
}));

// init body parser
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
// init le dossier public comme dossier static
app.use(express.static(path.join(__dirname, 'public')));
//Insère la favicon
app.use(favicon(path.join(__dirname, 'public/', 'favicon.png')));
// Init les routes
app.use('/', routes);
app.use('/play', play);

//A chaque fois qu'une requête est effectué
app.use(function(req, res, next){
    var name = req.session.name;
    var user = req.session.USER;
    if(!user)
    {
        user = req.session.USER = null;
    }
    if(!name)
    {
        name = req.session.name = "";
    }
    next();
});


// error handlers

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});
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

// Connection a la base mongoDb
mongoose.connect('mongodb://localhost/NodeJS-Games', function(err) {
    if (err) { throw err; }
    // Pour supprimer la base de donnée
    //mongoose.connection.db.dropDatabase();
});


app.session = session;
app.mongoose = mongoose;
module.exports = app;
