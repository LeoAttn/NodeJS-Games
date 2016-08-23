var express = require('express');
var session = require('express-session');

var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var lusca = require('lusca');
var less = require('less-middleware');
var mongoose = require('mongoose');
var Store = require('connect-mongo')(session);

var routes = require('./app/routes/index');
var play = require('./app/routes/play');
var user = require('./app/routes/user');
var api = require('./app/routes/api');

var app = express();

//app.set('env', 'production');
// view engine setup
app.set('views', path.join(__dirname, 'app/views'));
app.set('view engine', 'jade');
// init morgan logger
app.use(logger('dev'));
//Initialise le middleware cookie parser
app.use(cookieParser("secret"));
// Connection a la base mongoDb
mongoose.connect('mongodb://localhost/NodeJS-Games', function (err) {
    if (err)
        throw err;
    // Pour supprimer les rooms de la base de données à chaque redémarage du serveur
    mongoose.connection.db.dropCollection('Rooms', function (err, result) {
        if (result)
            console.log('Rooms dropped !');
    });
});
//Initialise le middleware de session
app.use(session({
    store: new Store({mongooseConnection: mongoose.connection}),
    secret: 'secret',
    resave: false,
    saveUninitialized: true
}));

//Lie le css avec le module less
app.use(less(path.join(__dirname, 'app', 'less'), {
    dest: path.join(__dirname, 'public'),
    preprocess: {
        path: function (pathname, req) {
            return pathname.replace(path.sep + 'stylesheets' + path.sep, path.sep);
        }
    }
}));

// init body parser
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));

// init le dossier public comme dossier static
app.use(express.static(path.join(__dirname, 'public')));
//Insère la favicon
app.use(favicon(path.join(__dirname, 'public/', 'favicon.png')));

var formidable = require('formidable');
app.use('/user/update', function (req, res, next) {
    var form = new formidable.IncomingForm();
    form.parse(req, function (err, fields, files) {
        if (fields != undefined)
            req.body = fields;
    });
    console.log("csrf " + req.body._csrf);
    form.on('end', function() {
        req.form = form;
        next();
    });
});

app.use(lusca({
    csrf: true,
    csp: '',
    xframe: 'SAMEORIGIN',
    p3p: 'ABCDEF',
    hsts: {maxAge: 31536000, includeSubDomains: true, preload: true},
    xssProtection: true
}));
//A chaque fois qu'une requête est effectué
app.use(function (req, res, next) {
    if (!req.session.isAuthenticated) {
        req.session.avatarLink = "/images/default.png";
    }
    res.locals.csrf = req.csrfToken();
    console.log(res.locals.csrf);
    res.locals.session = req.session;
    res.locals.url = req.url;
    next();
});

// Init les routes
app.use('/', routes);
app.use('/play', play);
app.use('/api', api);

app.use('/user', user);

// error handlers

// catch 404 and forward to error handler
app.use(function (req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});
// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function (err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            title: 'Bataille Navale - Erreur',
            message: err.message,
            error: err
        });
    });
}
// production error handler
// no stacktraces leaked to user
app.use(function (err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        title: 'Bataille Navale - Erreur',
        message: err.message
    });
});


app.session = session;
app.mongoose = mongoose;
module.exports = app;
