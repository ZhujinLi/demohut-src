var createError = require('http-errors');
var express = require('express');
var favicon = require('express-favicon');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var fs = require('fs')
var https = require('https')
var redirectToHTTPS = require('express-http-to-https').redirectToHTTPS
var serveIndex = require('serve-index');

var indexRouter = require('./routes/index');

var app = express();

app.use(favicon(__dirname + '/public/favicon.jpg'));

// Don't redirect if the hostname is `localhost:port` or the route is `/insecure`
app.use(redirectToHTTPS([/localhost:(\d{4})/], [/\/insecure/], 301));

// view engine setup
var viewPaths = [path.join(__dirname, 'views')];
fs.readdirSync(path.join(__dirname, 'public/subjs/')).forEach((f) => {
  if (f.startsWith('subj-'))
    viewPaths.push(path.join(__dirname, 'public/subjs/', f));
});
app.set('views', viewPaths);
app.set('view engine', 'jade');
app.locals.basedir = path.join(__dirname, 'views');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use('/public', express.static(path.join(__dirname, 'public')), serveIndex(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'node_modules')));

app.use('/', indexRouter);

// start https server
let sslOptions = {
  key: fs.readFileSync('zhujin_li_key.txt'),
  cert: fs.readFileSync('zhujin_li.crt')
};

app.listen(80);

https.createServer(sslOptions, app).listen(443);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
