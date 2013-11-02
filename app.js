/**
* app main module!
*/
var fs = require('fs');
var express = require('express');
var app = express();
var server = require('http').createServer(app);

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
  var redisClient = redis.createClient(6379);
  var pub = redis.createClient(6379 );
  var sub = redis.createClient(6379);
}

var RedisStore = require('connect-redis')(express);
var connect = require('connect');
var sessionStore = new RedisStore({client: redisClient});
var path = require('path'); 
var colors = require('colors');
var io = require('socket.io').listen(server);
var cookieParser = express.cookieParser('revolution!');
var SessionSockets = require('session.socket.io');
var async = require('async');
var useragent = require('express-useragent');
var AWS = require('aws-sdk');

var sessionMaxAge = 20 * 60 * 1000;
var cookieMaxAge = 1 * 30 * 24 * 60 * 60 * 1000;

var config = require('./config')(app, express, connect, path, cookieParser, useragent, 
  sessionStore, sessionMaxAge, colors, redisClient, io, mongoose, 
  SessionSockets);

var sessionSockets = config.sessionSockets;

var models = {
  Session: require('./models/session')(mongoose, async),
  index: require('./models/index')(mongoose, async),
  logins: require('./models/logins')(mongoose),
  activityMessages: require('./models/activitymessages')
};

models.User = require('./models/User')(mongoose, async, models.logins, models);
models.activities = require('./models/activities')(mongoose, models, async);
models.projects = require('./models/projects')(mongoose, models, async);
models.Audio = require('./models/audio')(mongoose, async, models);

var emails = {
  invites: require('./emails/invites')(app)
}

AWS.config.loadFromPath('./aws.json');




if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

var routes = {
  index: require('./routes/index')(models, sessionMaxAge, async),
  user: require('./routes/user')(fs, redis, redisClient, models, io, sessionMaxAge, cookieMaxAge, emails),
  project: require('./routes/project')(fs, models, sessionMaxAge),


  audio: require('./routes/audio')(models, AWS.config.credentials.accessKeyId, AWS.config.credentials.secretAccessKey, AWS)
};

require('./router')(routes, app);

var joinRoom = function(username, socket, store){

    store.smembers(username+':rooms', function(error, reply){
      
      for (var i = 0; i < reply.length; ++i) {
        console.log(username)
        console.log(reply[i])

        socket.join(reply[i]);
        if (io.sockets.sockets[reply[i]] && reply[i] != username){

          io.sockets.emit('user:activity', username + ' subscribed to '+reply[i]+'!');

          console.log('%s just subscribed to %s', username, reply[i]);
        
          var message = username + ' just subscribed to you!';
          io.sockets.sockets[io.sockets.sockets[reply[i]]].emit('user:notification', message);

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

    if (session.username) {
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
        models.activities[i](data, session)
      });
    }

  });


  server.listen(app.get('port'), function(){
    console.log('Express server listening on port '.prompt + app.get('port'));
  });
