module.exports = function(fs, redis, redisClient, models){

	var index = function(req, res, next){
		if (!req.session || !req.session.uid)
			return res.sendfile('views/login.html');
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
		console.log('login');
		// return res.send('LOGIN Request Recieved for: ' + req.body.username + ' Password: ' +
		// 	req.body.password + ' ...Thanks for loging in...');

		// if (req.session && req.session.uid) return res.redirect('/');

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
				});
				return res.redirect('/');
			}
			
			if (r && r.erro && r.error.code == 500) {
				console.log('POST /login Failed to fetch the user info!'.error);
				res.status(500);
				return res.send('Sorry! We had a problem logging you in. Please try '
					+ 'again a bit later. Thanks!');

			}

			if (req.session && req.session.uid) delete req.session.uid;

			return res.send(401);
		});
	}; 

	var logout = function(req, res, next) {
		if (!req.session || !req.session.uid) res.redirect('/login');
		console.log('GET /logout, uid: ' + req.session.uid);
		redisClient.get(req.session.uid, function(err, reply){
			delete req.session.uid;
			redisClient.del(req.session.uid, redis.print);
			res.send('logged out: ' + reply);
			res.redirect('/login');
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
		models.User.userExists(req.body.username, function(yes){
			if (yes) {
				console.log('POST /register: User Exists.'.error);
				return res.send(400)
			};
	 		models.User.createUser({
	 			username: req.body.username,
	 			password: req.body.password,
	 			name: req.body.name
	 		}, function(r){
				if (!r || (r && r.error)) {
					console.log('models.User.createUser callback error:'.error);
					console.log(r.error);
					return res.send(500);
				};
				req.session.uid = r.id;
				redisClient.set(r.id, req.body.username, redis.print);
				console.log('Successfully registered: ' + req.session.uid);
				return res.redirect('/');
			});
		});
	};


	return {
		index: index,
		public: public,
		partials: partials,
		login: login,
		logout: logout,
		register: register
	}
};
