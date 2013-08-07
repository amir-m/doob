module.exports = function(fs, redis, redisClient, models){

	var index = function(req, res, next){
		if (!req.session || !req.session.uid)
			//return res.sendfile('views/login.html');
			return res.render('login')
		else
			return res.sendfile('views/index.html');
	};

	var public = function(req, res, next){
		res.sendfile('public/'+req.params[0]);
	};

	var partials = function(req, res, next){
		res.sendfile('partials/'+req.params[0]);
	};

	var login = function(req, res, next) {
	
		var requestor = {
			ip: req.ip,
			date: new Date(),
			timestamp: (new Date()).getTime(),
			host: req.host,
			path: req.path,
			sessionID: req.cookies['connect.sid']
		};

		if (!req.body.username || req.body.username.length < 1 || 
			!req.body.password || req.body.password.length < 1) {
			res.status(400);
			console.log('POST /login: Missing Username or Password.'.error);
			return res.send('Email and Password Are Required.');
		};

		models.User.authenticateUser(req.body.username, req.body.password, requestor, function(r){
			
			if (r && r.success) {
				console.log('POST /login Successfull Login.'.info);
				req.session.uid = r.id;
				redisClient.set(r.id, req.body.username.toString(), redis.print);
				redisClient.get(r.id, function(err, reply) {
					console.log('Successfully login: ' + reply);	
					return res.redirect('/');
				});
				//res.send(")]}',\n [{me: " + req.body.username.toString() + "}]");
			}
			
			if (r && r.error && r.error.code == 500) {
				console.log('POST /login Failed to fetch the user info!'.error);
				res.status(500);
				return res.send('Sorry! We had a problem logging you in. Please try '
					+ 'again a bit later. Thanks!');
			}
			if (r && r.error && r.error.code == 401) return res.send(401);
		});
	}; 

	var logout = function(req, res, next) {
		
		var requestor = {
			ip: req.ip,
			date: new Date(),
			timestamp: (new Date()).getTime(),
			host: req.host,
			path: req.path,
			sessionID: req.cookies['connect.sid']
		};

		if (!req.session || !req.session.uid) return res.send(404);
		
		console.log('GET /logout, uid: ' + req.session.uid);

		redisClient.get(req.session.uid, function(err, reply){

			models.User.logout(reply, requestor);
			delete req.session.uid;
			redisClient.del(req.session.uid, redis.print);
			res.send(200);

		});
	};

	var register = function(req, res, next){
		
		var requestor = {
			ip: req.ip,
			date: new Date(),
			timestamp: (new Date()).getTime(),
			host: req.host,
			path: req.path,
			sessionID: req.cookies['connect.sid']
		};

		if (req.session && req.session.uid) delete req.session.uid;

		if (!req.body.username || req.body.username.length < 1 || 
			!req.body.password || req.body.password.length < 1 ) {
			console.log('POST /register: Bad Registration Request.'.error);
			return res.send(400);
		};

 		models.User.createUser({
 			username: req.body.username,
 			password: req.body.password,
 			requestor: requestor
 		}, function(r){
			if (!r) {
				console.log('models.User.createUser callback error:'.error);
				console.log(r.error);
				return res.send(500);
			};
			if (r.error){
				console.log('models.User.createUser Bad Request'.error);
				return res.send(400);
				
			}
			req.session.uid = r.id;
			redisClient.set(r.id, req.body.username, redis.print);
			console.log('Successfully registered: ' + req.session.uid);
			return res.redirect('/');
		});
	};

	var me = function(req, res, next) {
		
		var requestor = {
			ip: req.ip,
			date: new Date(),
			timestamp: (new Date()).getTime(),
			host: req.host,
			path: req.path,
			sessionID: req.cookies['connect.sid']
		};

		if (!req.session) return res.send(404);
		if (!req.session.uid) return res.send(404);

		// models.User.me(req.session.uid, requestor, res.send);

		models.User.me(req.session.uid, requestor, function(_me){
			res.send(_me);
		});

		// redisClient.get(req.session.uid, function(error, reply){
		// 	res.set('Content-Type', 'application/json');
		// 	res.send({'username': reply.toString()});
		// });
	};

	return {
		index: index,
		public: public,
		partials: partials,
		login: login,
		logout: logout,
		register: register,
		me: me
	}
};
