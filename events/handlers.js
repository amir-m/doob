module.exports = function(io, socket, session, store, models) {

/**
* handleres files!
*/

  // var follow = function(toBefolloewd, followingBy){
  //   models.User.follower(toBefolloewd, followingBy, function(res){
  //     // if (res == 500) // handle
  //   });

  //   redisClient.sismember('connected', toBefolloewd, function(err, reply){
  //     // if toBefollowed is online, join her room
  //     if (reply) socket.join(toBefolloewd);
  //   })
  // };

  // var unFollow = function(toBeUnfolloewd, unFollowingBy){
  //   models.User.unFollow(toBeUnfolloewd, unFollowingBy, function(res){
  //     // if (res == 500) // handle
  //   });

  //   // redisClient.sismember('connected', toBeUnfolloewd, function(err, user){
  //     // if toBeUnfollowed is online, leave her room
  //     // if (user) 
  //       socket.leave(toBefolloewd);
  //   // })
  // };
  
  var disconnect = function(){
    console.log('disconnecting: %s: %s, %s', socket.id, session.username, 
      io.sockets.sockets[session.username]);
 
    socket.broadcast.to(session.username).emit('user:broadcast:stop', {
      broadcaster: session.username      
    });

    delete io.sockets.sockets[session.username];

    // remove the user from broadcasters list.
    store.srem('broadcasters', session.username, function(error){
      if (error) console.log(error)
    });
  };

  var userSubscribe = function(data) {

      store.smembers(data.broadcaster+':rooms', function(error, reply){

        if (error) {
          console.log('error:handlers:userSubscribe:store.smembers(data.broadcaster+`:rooms`'.error);
          return;
        }

        
        // if the data.broadcaster already subscribed to data.to, there's no need to subscribe 
        // again!
        if (reply.indexOf(data.to) != -1) return;
        
        // tell everyone that the user's now subscribing to the other user.
        // io.sockets.emit('user:activity', data.broadcaster + ' subscribed to '+data.to+'!');
        

        console.log('%s just subscribed to %s', data.broadcaster, data.to);
        
        socket.join(data.to);
        
        // emit a notification to the user who is being subcribe to if she's online..
        if (io.sockets.sockets[data.to])
          io.sockets.sockets[io.sockets.sockets[data.to]].emit('user:notification', 
            data.broadcaster + ' just subscribed to you!');

        models.User.User.update({username: data.broadcaster}, 
          {$push: {subscribedTo: data.to}}, function(error, result){
            if (error) console.log(error)
            else console.log(error)
          });
        models.User.User.update({username: data.to}, 
          {$push: {subscribers: data.broadcaster}}, function(error, result){
            if (error) console.log(error)
            else console.log(error)
          });

        // save the subscription to redis: key: data.broadcaster, field: 'rooms', value (room): data.to
        store.sadd(data.broadcaster+':rooms', data.to);
      // }
      
    });
    
  };

  var userUnsubscribe = function(data){

    store.smembers(data.username+':rooms', function(error, reply){
      
      // if the user already unsubscribed, there's no need to unsubscribe again!
      if (reply.indexOf(data.from) == -1) return;
      

      console.log('%s just unsubscribed from %s', data.username, data.from);
      socket.leave(data.from);
      
      // emit a notification from the user who is being subcribe from if she's online..
      if (io.sockets.sockets[data.from])
        io.sockets.sockets[io.sockets.sockets[data.from]].emit('user:notification', 
          data.username + ' just unsubscribed from you!');

      // remove the subscription from redis: key: 'data.username:'rooms', value (room): data.from
      store.srem(data.username+':rooms', data.from, function(error){
        if (error) console.log(error)
      });
    });
  };

  var u_b_start = function(data){

    // tell everyone that the user's now broadcasting
    io.sockets.emit('user:activity', data.broadcaster + ' is now broadcasting!');
    // models.Users.activity({
    //   type: 'user:broadcast:start',
    //   broadcaster: data.broadcaster,
    // });
    
    // send the production session's data to all subscribers.
    // io.sockets.in(data.username).emit('user:broadcast:entire:session', data.doob);
    socket.broadcast.to(data.broadcaster).emit(data.event, data);

    console.log('%s: %s just started to broadcast..', data.broadcaster, data.broadcaster);
    // console.log(data);

    store.sadd('broadcasters', data.broadcaster);
  }

  var u_b_stop = function(data) {
    
    // tell everyone that the user's now broadcasting
    io.sockets.emit('user:activity', data.broadcaster + ' is not broadcasting anymore!');
    
    // send the production session's data to all subscribers.
    // io.sockets.in(data.username).emit('user:broadcast:entire:session', data.doob);
    socket.broadcast.to(data.broadcaster).emit('user:broadcast:stop', data);

    console.log('%s stopped broadcasting...', data.broadcaster);
    // console.log(data);

    store.srem('broadcasters', data.broadcaster);
  }

  var syncReq = function(data) {

  };

  var syncRes = function(data) {

    console.log('sync subscriber requestor: %s, sync subscriber response: %s', 
      data.subscriber, data.broadcaster);
    io.sockets.sockets[io.sockets.sockets[data.subscriber]].emit('sync:response', data);

  };

  var forward = function (data) {
    socket.broadcast.to(data.subscriber).emit(data.event, data);
    if (data.event != 'new:aduio:Sound') 
      models.projects.update(data, session);
  };

  var changeTempo = function (data) {
    socket.broadcast.to(data.subscriber).emit(data.event, data);
      models.projects.changeTempo(data, session);
  };

  var changeSteps = function (data) {
    socket.broadcast.to(data.subscriber).emit(data.event, data);
      models.projects.changeSteps(data, session);
  };

  var saveSP = function(data) {

    console.log(data);

    models.projects.newSoundPattern(data, session, function(error, sp){

      if (error) {
        console.log(error)
      };

    });
  };

  var fetchSoundPatterns = function(data) {

    models.projects.fetchSoundPatterns(session.uid, function(error, sps){
      if (error) return console.log(error);

      if (io.sockets.sockets[data.broadcaster])
          io.sockets.sockets[io.sockets.sockets[data.broadcaster]].
          emit('fetch:SoundPatterns:response', {
            event: 'fetch:SoundPatterns:response',
            broadcaster: 'sys',
            subscriber: data.subscriber,
            timestamp: new Date().getTime(),
            message: {
              SoundPatterns: sps
            }
          });

    });

  };

  var removeSoundPattern = function(data) {
    // console.log(data)
    models.projects.SoundPattern.update({_id: data.message.id}, {$set: {
      updated: new Date().getTime(),
      active: false
    }}, function(error){
      if (error) console.log(error);
    });

    models.User.User.update({username: {$in: [data.broadcaster, data.subscriber] }},
      {$inc: {soundPatterns: -1}}, {multi:true}, function(error){
      if (error) console.log(error);
    });
  };

  var newSoundPatternComment = function(data) {
    // console.log(data)
    models.projects.SoundPattern.update({_id: data.patternId}, {$push: {
      comments: {
        timestamp: data.timestamp,
        commenter: data.commenter,
        comment: data.comment
      }
    }}, function(error){
      if (error) console.log(error);
      console.log('finissssssh')
    });

  };

  return {
    'disconnect': disconnect,
    'user:broadcast:start': u_b_start,
    'user:broadcast:stop': u_b_stop,
    'user:subscribe': userSubscribe,
    'user:unsubscribe': userUnsubscribe,
    'sync:response': syncRes,
    'new:aduio:Sound': forward,
    'update:sequencer:SoundPattern:newTrack': forward,
    'update:sequencer:SoundPattern:toggleNote': forward,
    'update:sequencer:SoundPattern:removeTrack': forward,
    'update:sequencer:SoundPattern:changeTempo': changeTempo,
    'update:sequencer:SoundPattern:changeSteps': changeSteps,
    'new:sequencer:SoundPattern': saveSP,
    'fetch:SoundPatterns:request': fetchSoundPatterns,
    'remove:sequencer:SoundPattern': removeSoundPattern,
    'new:soundPattern:comment': newSoundPatternComment,
  };
};