module.exports = function(io, socket, session, store, models) {


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
    console.log('disconnecting: %s', socket.id);
    delete io.sockets.sockets[session.username];
  };

  var userSubscribe = function(data){

    store.smembers(data.username+':rooms', function(error, reply){
      
      // if the user already subscribed, there's no need to subscribe again!
      if (reply.indexOf(data.to) != -1) return;
      
      // tell everyone that the user's now subscribing to the other user.
      io.sockets.emit('user:activity', data.username + ' subscribed to '+data.to+'!');

      console.log('%s just subscribed to %s', data.username, data.to);
      socket.join(data.to);
      
      // emit a notification to the user who is being subcribe to if she's online..
      if (io.sockets.sockets[data.to])
        io.sockets.sockets[io.sockets.sockets[data.to]].emit('user:notification', 
          data.username + ' just subscribed to you!');

      // save the subscription to redis: key: data.username, field: 'rooms', value (room): data.to
      store.sadd(data.username+':rooms', data.to);
    });
    
  };

  var userUnsubscribe = function(data){

    store.smembers(data.username+':rooms', function(error, reply){

      console.log(reply.indexOf(data.from));
      
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

  var u_b_e_s = function(data){
    
    // tell everyone that the user's now broadcasting
    io.sockets.emit('user:activity', data.username + ' is now broadcasting!');
    
    // send the production session's data to all subscribers.
    io.sockets.in(data.username).emit('user:broadcast:entire:session', data);

    console.log('user:broadcast:entire:session: %s just started to broadcast..', data.username);
    // console.log(data);
  }

  var joinRoome = function(username){

    store.smembers(username+':rooms', function(error, reply){
      
      for (var i = 0; i < reply.length; ++i) {

        // tell everyone that the user's now subscribing to the other user.
        io.sockets.emit('user:activity', username + ' subscribed to '+reply[i]+'!');

        console.log('%s just subscribed to %s', username, reply[i]);
        socket.join(reply[i]);
        
        // emit a notification to the user who is being subcribe to if she's online..
        if (io.sockets.sockets[reply[i]]){
          var message = username + ' just subscribed to you!';
          io.sockets.sockets[io.sockets.sockets[reply[i]]].emit('user:notification', message);        
        }
      }
    });
  };

  return {
    disconnect: disconnect,
    userSubscribe: userSubscribe,
    userUnsubscribe: userUnsubscribe,
    u_b_e_s: u_b_e_s,
    joinRoome: joinRoome
  };
};