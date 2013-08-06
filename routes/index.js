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
		console.log(req.params[0].substring(0, req.params[0].indexOf('.')));
		res.render('partials/'+req.params[0]);
		// res.render('partials/' + req.params[0].substring(0, req.params[0].indexOf('.')));
	};

	var login = function(req, res, next) {

		if (!req.body.username || req.body.username.length < 1 || 
			!req.body.password || req.body.password.length < 1) {
			res.status(400);
			console.log('POST /login: Missing Username or Password.'.error);
			return res.send('Email and Password Are Required.');
		};

		models.User.authenticateUser(req.body.username, req.body.password, function(r){
			
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
		if (!req.session || !req.session.uid) res.send(404);
		console.log('GET /logout, uid: ' + req.session.uid);
		redisClient.get(req.session.uid, function(err, reply){
			delete req.session.uid;
			redisClient.del(req.session.uid, redis.print);
			res.send('logged out: ' + reply);
		});
	};

	var register = function(req, res, next){
		// return res.send('REGISTER Request Recieved for: ' + req.body.username + ' Password: ' +
		// 	req.body.password + ' ...Thanks for loging in...');
			
		if (req.session && req.session.uid) delete req.session.uid;

		if (!req.body.username || req.body.username.length < 1 || 
			!req.body.password || req.body.password.length < 1 ) {
			console.log('POST /register: Bad Registration Request.'.error);
			return res.send(400);
		};

 		models.User.createUser({
 			username: req.body.username,
 			password: req.body.password,
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
		if (!req.session) return res.send(404);
		if (!req.session.uid) return res.send(404);
		redisClient.get(req.session.uid, function(error, reply){
			res.set('Content-Type', 'application/json');
			// console.log(")]}',\n['me', '" + reply.toString() + "']")
			return res.send({'username': reply.toString()});
			// console.log('/m REPLY: %s', reply);
			// return res.send(reply);
		});
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
