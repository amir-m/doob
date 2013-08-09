var express = require('express');
var http = require('http');
var https = require('https');
var mongoose = require('mongoose');
var redis = require('redis');
var redisClient = redis.createClient();
var RedisStore = require('connect-redis')(express);
var connect = require('connect');
var path = require('path'); 
var colors = require('colors');
var fs = require('fs');

var httpsOptions = {
    key: fs.readFileSync('key.pem'),
    cert: fs.readFileSync('cert.pem')
};

var app = express();

// all environments
app.set('port', process.env.PORT || 8080);
app.set('views', __dirname + '/views');
app.set('view engine', 'jade');
app.set('view options', {layout: false});
app.use(express.static(path.join(__dirname, '/public')));
app.use(express.favicon('./public/img/icon.png'));
app.use(express.logger('dev'));
app.use(connect.bodyParser());
app.use(express.methodOverride());
app.use(express.cookieParser());
// app.use(express.session({
//   secret:'doob.io is TOP SECRET!',
//   store: new connect()
// }));
app.use(express.session({ 
  store: new RedisStore({client: redisClient}), 
  secret: 'keyboard cat',
  cookie: {maxAge: 600000} 
}));
app.use(app.router);

colors.setTheme({
  silly: 'rainbow',
  input: 'grey',
  verbose: 'cyan',
  prompt: 'grey',
  info: 'green',
  data: 'grey',
  help: 'cyan',
  warn: 'yellow',
  debug: 'blue',
  error: 'red'
});

redisClient.on("error", function (err) {
  console.log("Error " + err);
});

mongoose.connect("mongodb://localhost/doob", function(err){
    if (err) throw err;
});

var models = {
  User: require('./models/User')(mongoose)
};

var routes = require('./routes/index')(fs, redis, redisClient, models);

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

app.get('/public/*', routes.public);

app.get('/partials/*', routes.partials);

app.get('/me', routes.me);

app.get('/logout', routes.logout);

app.post('/login', routes.login);

app.post('/register', routes.register);

app.get('/', routes.index);

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});

https.createServer(httpsOptions, app).listen(8083, function(){
    console.log('Express server listening on port ' + 8083);
});




