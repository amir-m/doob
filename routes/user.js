module.exports = function(fs, redis, store, models, io, sessionMaxAge, cookieMaxAge){

	var crypto = require('crypto'),
		_uid = crypto.createHash('sha256').update('uid').digest('hex').toString(),
		_sid = crypto.createHash('sha256').update('sid').digest('hex').toString(),
		_token = crypto.createHash('sha256').update('token').digest('hex').toString();

	// Scenario 2.
	var login = function(req, res, next) {

		var requestor = {
			ip: req.ip,
			date: new Date(),
			timestamp: (new Date()).getTime(),
			host: req.host,
			path: req.path,
			OS: req.useragent.OS,
			browser: req.useragent.Browser,
			browserVersion: req.useragent.Version,
			platform: req.useragent.Platform
		};
		// console.log(req.body.username)
		// console.log(req.body.password)
		// Scenario 2. 1.
		if (!req.body.username || req.body.username.length < 1 || 
			!req.body.password || req.body.password.length < 1) {
			
			var uid = req.cookies[_uid],
				sid = req.cookies[_sid],
				token = req.cookies[_token];
			
			// Scenario 2. 1.b
			if (!uid || !sid || !token)	return res.send(400);


			else {
				
				// Scenario 2. 1.a.i
				models.Session.validate(uid, sid, token, requestor, function(error, result){

					// Scenario 2. 1.a.i.3.d
					if (error && error == 401) {

						req.session.uid = req.session ? null : null;
						req.session.username = req.session ? null : null;

						res.clearCookie(_uid);
						res.clearCookie(_sid);
						res.clearCookie(_token);

						return res.send(401);
					}

					if (error) res.send(error);


					// Scenario 2. 1.a.i.4.b
					if (result) {

						// set cookies
						res.cookie(_uid, uid, { maxAge: cookieMaxAge, httpOnly: true });
		            	res.cookie(_sid, sid, { maxAge: cookieMaxAge, httpOnly: true });
		            	res.cookie(_token, result.token, { maxAge: cookieMaxAge, httpOnly: true });

		            	// set session variables.
		            	models.User.User.findById(result.uid, 'username', function(error, user){
		            		
		            		if (error) return res.send(500);

		            		// Scenario 2. 1.a.i.4.c		
		            		req.session.uid = result.uid;
		            		req.session.username = user.username;

							req.session.cookie.expires = new Date(Date.now() + sessionMaxAge);
							req.session.cookie.maxAge = sessionMaxAge;		            		

		            		return res.send(200);
		            	});
					}
					
					// Scenario 2. 1.a.i.2
					else return res.send(401);
				});
			}
		}

		// Scenario 2 .2
		else

			// Scenario 2 .2.a
			models.User.authenticateUser(req.body.username, req.body.password, requestor, 
				function(error, result) {
					
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

			            if (req.body.rememberMe == '1') 
			            	models.Session.create(result.id, requestor, function(error, u, s, t) {
			            		if (error) return res.send(500);
			            		// set cookies
								res.cookie(_uid, u, { maxAge: cookieMaxAge, httpOnly: true });
				            	res.cookie(_sid, s, { maxAge: cookieMaxAge, httpOnly: true });
				            	res.cookie(_token, t, { maxAge: cookieMaxAge, httpOnly: true });
								
								return res.send(200);
			            	}); 
						
			            else return res.send(200);
			        }
					else return res.send(404);
			});
	}; 

	var logout = function(req, res, next) {

		res.clearCookie('undefined');

		if (!req.session || !req.session.uid) return res.send(404);

		if (req.cookies[_uid] && req.cookies[_sid] && req.cookies[_token]) {

			models.Session.delete_session(req.cookies[_uid], req.cookies[_sid], req.cookies[_token],
			function(error, result){

				if (error) return res.send(error);

				req.session.uid = null;
				req.session.username = null;

				res.clearCookie(_uid);
				res.clearCookie(_sid);
				res.clearCookie(_token);
				
				return res.send(200);
			});
		}
	};

	var register = function(req, res, next){
		
		var requestor = {
			ip: req.ip,
			date: new Date(),
			timestamp: (new Date()).getTime(),
			host: req.host,
			path: req.path,
			OS: req.useragent.OS,
			browser: req.useragent.Browser,
			browserVersion: req.useragent.Version,
			platform: req.useragent.Platform
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
			req.session.username = req.body.username;
			console.log('Successfully registered: %s %s', req.body.username, req.session.uid);
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
			OS: req.useragent.OS,
			browser: req.useragent.Browser,
			browserVersion: req.useragent.Version,
			platform: req.useragent.Platform
		};


		if (!req.session || !req.session.uid) return res.send(404);

		res.set('Content-Type', 'application/json');

		if (req.session && req.session.username) {

			return res.send({username: req.session.username});
		}

		models.User.me(req.session.uid, requestor, function(_me){
			req.session.username = _me.username;
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
