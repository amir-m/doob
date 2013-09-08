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

  var rtg = require("url").parse(process.env.REDISTOGO_URL);
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

require('./config')(app, express, connect, path, cookieParser, useragent, 
  sessionStore, sessionMaxAge, colors, redisClient, io, mongoose);


// var host = 'https://localhost:8080';

// var text = 'display: inline-block;*display: inline;*zoom: 1;padding: 4px 12px;margin-bottom: 0;font-size: 14px;line-height: 20px;text-align: center;vertical-align: middle;cursor: pointer;color: #333333;text-shadow: 0 1px 1px rgba(255, 255, 255, 0.75);background-color: #f5f5f5;background-image: -moz-linear-gradient(top, #ffffff, #e6e6e6);background-image: -webkit-gradient(linear, 0 0, 0 100%, from(#ffffff), to(#e6e6e6));background-image: -webkit-linear-gradient(top, #ffffff, #e6e6e6);background-image: -o-linear-gradient(top, #ffffff, #e6e6e6);background-image: linear-gradient(to bottom, #ffffff, #e6e6e6);background-repeat: repeat-x;filter: progid:DXImageTransform.Microsoft.gradient(startColorstr="#ffffffff", endColorstr="#ffe6e6e6", GradientType=0);border-color: #e6e6e6 #e6e6e6 #bfbfbf;border-color: rgba(0, 0, 0, 0.1) rgba(0, 0, 0, 0.1) rgba(0, 0, 0, 0.25);*background-color: #e6e6e6;filter: progid:DXImageTransform.Microsoft.gradient(enabled = false);border: 1px solid #cccccc;*border: 0;border-bottom-color: #b3b3b3;-webkit-border-radius: 4px;-moz-border-radius: 4px;border-radius: 4px;*margin-left: .3em;-webkit-box-shadow: inset 0 1px 0 rgba(255,255,255,.2), 0 1px 2px rgba(0,0,0,.05);-moz-box-shadow: inset 0 1px 0 rgba(255,255,255,.2), 0 1px 2px rgba(0,0,0,.05);box-shadow: inset 0 1px 0 rgba(255,255,255,.2), 0 1px 2px rgba(0,0,0,.05);'

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
//    // text: "You got right? Thanks :)" // plaintext body
//   html: '<link rel="stylesheet" type="text/css" href="localhost:8080/public/css/bootstrap.css">' +
//         '<h1>Thanks man!<br><button style="'+text+'">Thanks!</button></h1>'
// };
// smtpTransport.sendMail(mailOptions, function(error, response){
//    if(error){
//        console.log(error);
//    }else{
//        console.log("Message sent: " + response.message);
//    }
// });






// Socket server config and setup.
var sessionSockets = new SessionSockets(io, sessionStore, cookieParser, 'sessionid');




var models = {
  Session: require('./models/session')(mongoose, async),
  index: require('./models/index')(mongoose, async),
  logins: require('./models/logins')(mongoose),
  activityMessages: require('./models/activitymessages')
};

models.User = require('./models/User')(mongoose, async, models.logins);
models.activities = require('./models/activities')(mongoose, models, async);
models.projects = require('./models/projects')(mongoose, models, async);




// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

var routes = {
  index: require('./routes/index')(models, sessionMaxAge),
  user: require('./routes/user')(fs, redis, redisClient, models, io, sessionMaxAge, cookieMaxAge),
  project: require('./routes/project')(fs, models, sessionMaxAge)
};

require('./router')(routes, app);



var joinRoom = function(username, socket, store){

    store.smembers(username+':rooms', function(error, reply){
      
      for (var i = 0; i < reply.length; ++i) {
        console.log(username)
        console.log(reply[i])
        // console.log(io.sockets.sockets[username])
        // console.log(io.sockets.sockets[reply[i]])

        // emit a notification to the user who is being subcribe to if she's online..
        socket.join(reply[i]);
        if (io.sockets.sockets[reply[i]] && reply[i] != username){

          // tell everyone that the user's now subscribing to the other user.
          io.sockets.emit('user:activity', username + ' subscribed to '+reply[i]+'!');

          console.log('%s just subscribed to %s', username, reply[i]);
        
          var message = username + ' just subscribed to you!';
          io.sockets.sockets[io.sockets.sockets[reply[i]]].emit('user:notification', message);

          // request the latest doob instance
          io.sockets.sockets[io.sockets.sockets[reply[i]]].emit('sync:request', {
            subscriber: username,
            broadcaster: reply[i]
          });        
        }
      }
    });
  };

sessionSockets.on('connection', function(err, socket, session){

  if (err) throw err;

  if (!session || !session.uid) {
    socket.disconnect();
    return;
  }
  var events = require('./events/handlers')(io, socket, session, redisClient, models);
  // var activities = require('./events/activities')(models);

  if (session.username) {
    // socket.set('username', user.username);
    if (io.sockets.sockets[session.username]) delete io.sockets.sockets[session.username];
    io.sockets.sockets[session.username] = socket.id;
    console.log('connecting: %s to %s'.prompt, session.username, socket.id);

    joinRoom(session.username, socket, redisClient);
  }

  else
    models.User.User.findOne({_id: session.uid}, function(error, user){
      if (error) throw error;
      if (!user || !user.username) throw 'BAD USER !!!';

      session.username = user.username;
      session.save();
      
      if (io.sockets.sockets[session.username]) delete io.sockets.sockets[session.username];
      io.sockets.sockets[session.username] = socket.id;
      console.log('connecting: %s to %s'.prompt, session.username, socket.id);

      joinRoom(session.username, socket, redisClient);
    });

  

  for (var i in events) {
    socket.on(i, events[i]);
  }

  for (var i in models.activities) {
    socket.on(i, function(data){
      // args = arguments;
      // console.log(args)
      models.activities[i](data, session)
    });
  }

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

