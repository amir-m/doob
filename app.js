var fs = require('fs');
var express = require('express');
var app = express();
var server = require('http').createServer(app);
// var server = require('https').createServer({
//   key: fs.readFileSync('key.pem'),
//   cert: fs.readFileSync('cert.pem')
// }, app);
var mongoose = require('mongoose');
var redis = require('redis');

if (process.env.REDISTOGO_URL) {

  var rtg   = require("url").parse(process.env.REDISTOGO_URL);
  var redisClient = redis.createClient(rtg.port, rtg.hostname);
  var pub = redis.createClient(rtg.port, rtg.hostname);
  var sub = redis.createClient(rtg.port, rtg.hostname);

  redisClient.auth(rtg.auth.split(":")[1]); 
  pub.auth(rtg.auth.split(":")[1]); 
  sub.auth(rtg.auth.split(":")[1]); 
} 

else {
  var redisClient = redis.createClient();
  var pub = redis.createClient();
  var sub = redis.createClient();
}

// var redisClient = redis.createClient();
var RedisStore = require('connect-redis')(express);
var connect = require('connect');
var sessionStore = new RedisStore({client: redisClient});
var path = require('path'); 
var colors = require('colors');
var io = require('socket.io').listen(server);
var cookieParser = express.cookieParser('revolution!');
var SessionSockets = require('session.socket.io');
// var broadcaster = redis.createClient(), subscriber = redis.createClient();
var nodemailer = require('nodemailer');
var async = require('async');
var useragent = require('express-useragent');

//                  m  * s  *  ms
var sessionMaxAge = 20 * 60 * 1000;
//                 m * d  * h  * m  * s  * ms    
var cookieMaxAge = 1 * 30 * 24 * 60 * 60 * 1000;


// var host = 'https://localhost:8080';

// var smtpTransport = nodemailer.createTransport("SMTP",{
//    service: "Gmail",
//    auth: {
//        user: "amir39648@gmail.com",
//        pass: "Carex615"
//    }
// });
// var mailOptions = {
//    from: "amir39648@gmail.com", // sender address
//    to: "amir@doob.io", // list of receivers
//    subject: "Test Email", // Subject line
//    text: "You got right? Thanks :)" // plaintext body
// };
// smtpTransport.sendMail(mailOptions, function(error, response){
//    if(error){
//        console.log(error);
//    }else{
//        console.log("Message sent: " + response.message);
//    }
// });



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


// Socket server config and setup.
var sessionSockets = new SessionSockets(io, sessionStore, cookieParser, 'sessionid');

io.configure(function(){
    io.set('log level', 1);
    io.set("transports", ["xhr-polling"]);
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

var models = {
  User: require('./models/User')(mongoose, async),
  Session: require('./models/session')(mongoose, async)//,
  // Logins: require('./models/logins')(mongoose)
};

var routes = {
  index: require('./routes/index')(models, sessionMaxAge),
  user: require('./routes/user')(fs, redis, redisClient, models, io, sessionMaxAge, cookieMaxAge)
};


// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

app.get('/public/*', routes.index.public);

app.get('/template/*', routes.index.template);

app.get('/partials/*', routes.index.partials);

app.get('/ping', routes.index.ping);

app.post('/destroy', routes.index.destroy);

app.post('/me', routes.user.me);

app.post('/logout', routes.user.logout);

app.get('/user/:name', routes.user.getUser);

app.post('/login', routes.user.login);

app.post('/register', routes.user.register);

app.get('/', routes.index.index);


sub.subscribe('amir');

sessionSockets.on('connection', function(err, socket, session){

  // console.log(session)

  if (err) throw err;

  if (!session || !session.uid) {
    socket.disconnect();
    return;
  }
  var events = require('./events/handlers')(io, socket, session, redisClient, models);

  if (session.username) {
    // socket.set('username', user.username);
    io.sockets.sockets[session.username] = socket.id;
    console.log('connecting: %s to %s'.prompt, session.username, socket.id);

    events.joinRoome(session.username);
  }

  else
    models.User.User.findOne({_id: session.uid}, function(error, user){
      if (error) throw error;
      if (!user || !user.username) throw 'BAD USER !!!';

      session.username = user.username;
      session.save();
      
      io.sockets.sockets[session.username] = socket.id;
      console.log('connecting: %s to %s'.prompt, session.username, socket.id);

      events.joinRoome(session.username);
    });

  // io.sockets.socket.get('username', function(){
  //   if (err) console.log(err); 
  // });
  socket.on('test', function(user){
    // pub.publish('test', user);
    socket.broadcast.emit('test');
  });

  socket.on('user:broadcast:entire:session', events.u_b_e_s);
  
  socket.on('user:subscribe', events.userSubscribe);

  socket.on('user:unsubscribe', events.userUnsubscribe);

  socket.on('user:new:pattern', function(data){
    socket.get('username', function(name){
      // if ()
    });
  });

  socket.on('disconnect', events.disconnect);

  socket.on('doob:assets', function(data){
    pub.publish()
    console.log(data);
  });

});


server.listen(app.get('port'), function(){
  console.log('Express server listening on port '.prompt + app.get('port'));
});

// httpServer.listen(8081, function(){
//   console.log('Express server listening on port '.prompt + 8081);
// });

// secureServer.listen(app.get('SSLPort'), function(){
//   console.log('Express Secure server listening on port '.prompt + app.get('SSLPort'));
// });

// redisClient.sadd('connected', 'key1', function(err){
//   redisClient.sismember('connected', 'key1', function(err, reply){
//     console.log('redis reply bitch: %s', reply)
//     redisClient.smembers('connected', function(err, reply){
//       console.log(reply.indexOf('key1'));
//     });
//   })
// })




// var key1 = 'key1';
// var s = { 'array': ['amir', 'yashar'] };
// redisClient.hmset(key1, s, function(error){
//   if (error) throw error;
//   // console.log(s);
//   redisClient.hgetall('key1', function(error, obj){
//     console.log('first hget');
//     console.log(obj);
//     obj['array'].push('gholam');
//     console.log(obj);
//     // redisClient.hmset(key1, {"sid": 'qwertyxzaq12ax' }, 
//     //   function(error){
//     //     if (error) throw error;
//     //     redisClient.hgetall('key1', function(error, obj){
//     //       if (error) throw error;
//     //       console.log('second hget');
//     //       console.log(obj);
//     //     });
//     //   });
//   }) 
// });

// redisClient.FLUSHALL(function(){
//   redisClient.keys('*', function(error, obj){
//     obj.forEach(function(r, i){
//       console.log(i + ":" + r);
//     });
//   }) 
// })

// broadcaster.del('Amir', function(error){
//   if (error) throw err;
// });

// console.log(require('crypto').createHash('sha256').update('u.password').digest('hex').toString())

