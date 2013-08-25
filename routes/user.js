module.exports = function(fs, redis, store, models, io){

	var login = function(req, res, next) {

		if (req.session && req.session.uid) req.session.uid = null;
		if (req.session && req.session.username) req.session.username = null;

		if (!req.body.username || req.body.username.length < 1 || 
			!req.body.password || req.body.password.length < 1) {
			res.status(400);
			console.log('POST /login: Missing Username or Password.'.error);
			return res.send('Email and Password Are Required.');
		};
		
		var requestor = {
			ip: req.ip,
			date: new Date(),
			timestamp: (new Date()).getTime(),
			host: req.host,
			path: req.path,
			sessionID: req.cookies['sessionid']
		};

		models.User.authenticateUser(req.body.username, req.body.password, requestor, 
			function(error, result){
				
				if (error && error.error && error.error.code == 401) return res.send(401);

				if (error) {
					console.log('POST /login Failed to fetch the user info!'.error);
					res.status(500);
					return res.send('Sorry! We had a problem logging you in. Please try '
						+ 'again a bit later. Thanks!');
				}


				if (result && result.success) {
				
		            req.session.uid = result.id.toString();
		            req.session.username = req.body.username;

		            console.log('POST /login Successfull Login: %s, %s'.info, 
		            	req.session.uid, result.username);
		            
					return res.redirect('/');
				}

				res.send(404);
		});
	}; 

	var logout = function(req, res, next) {

		if (!req.session || !req.session.uid) res.send(404);
		
		var requestor = {
			ip: req.ip,
			date: new Date(),
			timestamp: (new Date()).getTime(),
			host: req.host,
			path: req.path,
			sessionID: req.cookies['sessionid']
		};

		models.User.logout(req.session.uid, requestor, function(username){

			console.log('GET /logout, uid: %s, username: %s'.info, req.session.uid, username);
			req.session.uid = null;
			if (req.session.username) req.session.username = null;
			return res.send(200);
			
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

		if (req.session && req.session.uid) req.session.uid = null;
		if (req.session && req.session.username) req.session.username = null;

		if (!req.body.username || req.body.username.length < 1 || 
			!req.body.password || req.body.password.length < 1 ) {
			console.log('POST /register: Bad Registration Request.'.error);
			return res.send(400);
		};

 		models.User.createUser({
 			username: req.body.username,
 			password: req.body.password,
 			requestor: requestor
 		}, function(error, result){

			if (error && error.error){
				console.log('models.User.createUser Bad Request'.error);
				return res.send(400);
			}
			if (error || !result || !result.success) {
				console.log('models.User.createUser callback error:'.error);
				console.log(error);
				return res.send(500);
			}
			
			if (req.session && req.session.uid) req.session.uid = null;
			
			req.session.uid = result.id;
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
			sessionID: req.cookies['sessionid']
		};


		if (!req.session || !req.session.uid) return res.send(404);

		res.set('Content-Type', 'application/json');

		if (req.session && req.session.username) {

			return res.send({username: req.session.username});
		}

		models.User.me(req.session.uid, requestor, function(_me){
			res.send(_me);
		});
	};

	var getUser = function(req, res, next) {
		if (!req.param('name')) return res(400);

		models.User.getUser(req.param('name'), function(user){
			if (!user) return res.send(400);
			res.send(user)
		});
	};

	return {
		login: login,
		logout: logout,
		register: register,
		me: me,
		getUser: getUser
	}
};
