module.exports = function(app, express, connect, path, cookieParser, useragent, 
  sessionStore, sessionMaxAge, colors, redisClient, io, mongoose, 
  SessionSockets, callback) {


  // Express configurations.
  app.set('port', process.env.PORT || 8080);
  // app.set('SSLPort', 8000);
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.set('view options', {layout: false});
  app.use(express.static(path.join(__dirname, '/public')));
  app.use(express.favicon('./public/img/icon.png'));
  app.use(express.logger('dev'));
  app.use(connect.bodyParser());
  app.use(express.methodOverride());
  app.use(cookieParser);
  app.use(express.session({ 
    store: sessionStore, 
    key: 'sessionid',
    secret: 'revolution!',
    cookie: {
      maxAge: sessionMaxAge,
      httpOnly: true
    } 
  }));
  app.use(useragent.express());

  // app.use(function(req, res, next){
  //   // redirect all non-https trafic to https..
  //   // if (req.protocol != 'https') return res.redirect(host + req.url);
  //   console.log(req.useragent);
  //   next();
  // });


  app.use(app.router);

  // Using color themes.
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

  io.configure(function(){
    io.set('log level', 1);
    io.set("transports", ["xhr-polling"]);// "websocket"
  });


  redisClient.on("error", function (err) {
    console.log("Error ".error + err);
  });

  if (process.env.MONGOLAB_URI)
    var mg = process.env.MONGOLAB_URI;//require("url").parse(process.env.MONGOLAB_URI);
  else
    var mg = "mongodb://localhost/doob";

  mongoose.connect(mg, function(err){
    if (err) throw err;
    console.log('connected to mongoDB: %s', mg);
  });

  return {
    sessionSockets: new SessionSockets(io, sessionStore, cookieParser, 'sessionid')
  }

};