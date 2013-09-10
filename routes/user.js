module.exports = function(fs, redis, store, models, io, sessionMaxAge, cookieMaxAge, emails){

	var crypto = require('crypto'),
		// _uid = crypto.createHash('sha256').update('uid').digest('hex').toString(),
		// _sid = crypto.createHash('sha256').update('sid').digest('hex').toString(),
		// _token = crypto.createHash('sha256').update('token').digest('hex').toString();
		// user id
		_uid = 'e',
		// series id
		_sid = 'z',
		// toden id
		_token = 'd',

		// this cookie is not an http only cookie and is set to inform the client that series and
		// tokens are set, so the client can check whether the tokens exists and then request
		// login with token
		_cookieSet = 's',

		_cookieSetValue = crypto.createHash('sha1').update('already').digest('hex').toString()


	// Scenario 2.
	var login = function(req, res, next) {
		// return res.redirect('#/register/17763763829');
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

						req.session.uid = null;
						req.session.username = null;

						res.clearCookie(_uid);
						res.clearCookie(_sid);
						res.clearCookie(_token);
						res.clearCookie(_cookieSet);

						return res.send(401);
					}

					if (error) return res.send(error);


					// Scenario 2. 1.a.i.4.b
					if (result) {

						// set cookies
						res.cookie(_uid, uid, { maxAge: cookieMaxAge, httpOnly: true });
		            	res.cookie(_sid, sid, { maxAge: cookieMaxAge, httpOnly: true });
		            	res.cookie(_token, result.token, { maxAge: cookieMaxAge, httpOnly: true });
		            	res.cookie(_cookieSet, _cookieSetValue, { 
		            		maxAge: cookieMaxAge, httpOnly: false 
		            	});

		            	// set session variables.
		            	models.User.User.findById(result.uid, 'username', function(error, user){
		            		
		            		if (error) return res.send(500);

		            		if (!user || !user.username) res.send(401);

		            		// Scenario 2. 1.a.i.4.c		
		            		req.session.uid = result.uid;
		            		req.session.username = user.username;

							req.session.cookie.expires = new Date(Date.now() + sessionMaxAge);
							req.session.cookie.maxAge = sessionMaxAge;

							console.log('POST /login Successfull Login: %s, %s'.info, 
				            	req.session.uid, req.session.username);

							res.set('Content-Type', 'application/json');

		            		return res.send({'username': user.username});
		            	});
					}
					
					// Scenario 2. 1.a.i.2
					else return res.send(401);
				});
			}
		}

		// Scenario 2 .2
		else {
			var uid = req.cookies[_uid],
				sid = req.cookies[_sid],
				token = req.cookies[_token];
			
			// there's no active token for the user, go ahead and authenticate the user.
			if (!uid || !sid || !token) {


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
					            	res.cookie(_cookieSet, _cookieSetValue, { 
			            				maxAge: cookieMaxAge, httpOnly: false 
			            			});

					            	res.set('Content-Type', 'application/json');

			            			return res.send({'username': result.username});
									
									// return res.send(200);
				            	}); 
							
				            else return res.send(200);
				        }
						else return res.send(404);
				});
				
			}

			// a token was already issued to the user! it's wierd to get this point. Maybe
			// and attack is going on. First authenticate the token, and if not authorized,
			// check the username and password.
			else {

				models.Session.validate(uid, sid, token, requestor, function(error, result){
						

					// Scenario 2. 1.a.i.3.d
					if (error && error == 401) {

						req.session.uid = null;
						req.session.username = null;

						res.clearCookie(_uid);
						res.clearCookie(_sid);
						res.clearCookie(_token);
						res.clearCookie(_cookieSet);

						return res.send(401);
						
					}

					else if (error) return res.send(error);


					// Scenario 2. 1.a.i.4.b
					if (result) {

						// set cookies
						res.cookie(_uid, uid, { maxAge: cookieMaxAge, httpOnly: true });
		            	res.cookie(_sid, sid, { maxAge: cookieMaxAge, httpOnly: true });
		            	res.cookie(_token, result.token, { maxAge: cookieMaxAge, httpOnly: true });
		            	res.cookie(_cookieSet, _cookieSetValue, { 
		            		maxAge: cookieMaxAge, httpOnly: false 
		            	});

		            	// set session variables.
		            	models.User.User.findById(result.uid, 'username', function(error, user){
		            		
		            		if (error) return res.send(500);

		            		// Scenario 2. 1.a.i.4.c		
		            		req.session.uid = result.uid;
		            		req.session.username = user.username;

							req.session.cookie.expires = new Date(Date.now() + sessionMaxAge);
							req.session.cookie.maxAge = sessionMaxAge;

							res.set('Content-Type', 'application/json');

		            		return res.send({'username': user.username});
		            	});
					}
					
					
					else {
						// Now check the user name and password
						models.User.authenticateUser(req.body.username, req.body.password, requestor, 
						function(error, auth_result) {
							
							if (error && error.error && error.error.code == 401) return res.send(401);

							if (error) {
								console.log('POST /login Failed to fetch the user info!'.error);
								res.status(500);
								return res.send('Sorry! We had a problem logging you in. Please try '
									+ 'again a bit later. Thanks!');
							}

							if (auth_result && auth_result.success) {
							
					            req.session.uid = auth_result.id.toString();
					            req.session.username = req.body.username;

					            console.log('POST /login Successfull Login: %s, %s'.info, 
					            	req.session.uid, auth_result.username);

					            if (req.body.rememberMe == '1') 
					            	models.Session.create(auth_result.id, requestor, function(error, u, s, t) {
					            		if (error) return res.send(500);
					            		// set cookies
										res.cookie(_uid, u, { maxAge: cookieMaxAge, httpOnly: true });
						            	res.cookie(_sid, s, { maxAge: cookieMaxAge, httpOnly: true });
						            	res.cookie(_token, t, { maxAge: cookieMaxAge, httpOnly: true });
						            	res.cookie(_cookieSet, _cookieSetValue, { 
				            				maxAge: cookieMaxAge, httpOnly: false 
				            			});

						            	res.set('Content-Type', 'application/json');

				            			return res.send({'username': auth_result.username});
										
										// return res.send(200);
					            	}); 
								
					            else return res.send(200);
					        }
							else return res.send(404);
						});
					};
				});
			}

		}

	}; 

	var logout = function(req, res, next) {

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
				res.clearCookie(_cookieSet);
				
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

		models.Session.delete_session(req.cookies[_uid], req.cookies[_sid], 
			req.cookies[_token]);


		if (req.session && req.session.uid) req.session.uid = null;
		if (req.session && req.session.username) req.session.username = null;

		if (!req.body.username || req.body.username.length < 1 || 
			!req.body.password || req.body.password.length < 1 || 
			!req.body.email || req.body.email.length < 1) {
			console.log('POST /register: Bad Registration Request.'.error);
			return res.send(400);
		};

		// models.User.User.create({
 	// 		username: req.body.username,
 	// 		password: req.body.password,
 	// 		email: req.body.email,
 	// 		requestor: requestor
 	// 	});

 		models.User.createUser({
 			username: req.body.username,
 			password: req.body.password,
 			email: req.body.email,
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
			
			
			if (req.body.rememberMe == '1') 
            	models.Session.create(result.id, requestor, function(error, u, s, t) {
            		if (error) return res.send(500);
            		// set cookies
					res.cookie(_uid, u, { maxAge: cookieMaxAge, httpOnly: true });
	            	res.cookie(_sid, s, { maxAge: cookieMaxAge, httpOnly: true });
	            	res.cookie(_token, t, { maxAge: cookieMaxAge, httpOnly: true });
	            	res.cookie(_cookieSet, _cookieSetValue, { 
        				maxAge: cookieMaxAge, httpOnly: false 
        			});

	            	res.set('Content-Type', 'application/json');

        			return res.redirect('/')
					
					// return res.send(200);
            	}); 
			
            else return res.redirect('/');
			
		
		});
	};

	var me = function(req, res, next) {

		var requestor = {
			ip: req.ip,
			date: new Date(),
			timestamp: (new Date()).getTime(),
			host: req.host,
			path: req.path,
			params: req.params,
			OS: req.useragent.OS,
			browser: req.useragent.Browser,
			browserVersion: req.useragent.Version,
			platform: req.useragent.Platform
		};

		if (!req.session || !req.session.uid || !req.session.username) return res.send(401);

		res.set('Content-Type', 'application/json');

		var c = 0, f = {};

		for (var i in req.query) {
			++c;
			// if (c > 0) break;
			if (i != 'password' && i != '_id') f[i] = req.query[i];
		}
				
		// no parameter: the user only need username
		// if (c == 0) {
		// 	// send the username
		// 	return res.send(")]}',\n" + JSON.stringify({username: req.session.username}));
		// }



		models.User.me(req.session.uid, requestor, f, function(error, _me){

			if (error) return res.send(error);

			req.session.cookie.expires = new Date(Date.now() + sessionMaxAge);
			req.session.cookie.maxAge = sessionMaxAge;

			res.send(")]}',\n" + JSON.stringify(_me));
		});
	};

	var getUser = function(req, res, next) {
		
		if (!req.param('name') || !req.session || !req.session.uid || !req.session.username) 
			return res.send(401);

		models.User.getUser(req.param('name'), function(user){
			if (!user) return res.send(400);
			res.send(user)
		});
	};

	var patterns = function(req, res, next) {

		if (!req.param('user')) return res.send(400);

		models.projects.SoundPattern.find({
			username: req.param('user'), active: true}, function(error, p){

			if (error) return res.send(500);
			if (!p) return res.send(400);

			var r = ")]}',\n" + JSON.stringify(p);

			res.send(r);
		});
	};

	var pattern = function(req, res, next) {

		if (!req.param('id') || !req.session || !req.session.uid || !
			req.session.username) return res.send(401);

		models.projects.SoundPattern.find({
			_id: req.param('id'), active: true}, function(error, p){

			if (error) return res.send(500);
			if (!p) return res.send(400);

			var r = ")]}',\n" + JSON.stringify(p);

			res.send(r);
		});
	};


	var follow = function(req, res, next) {

		if (!req.body._id || !req.session || !req.session.uid || !
			req.session.username || !req.body.username) return res.send(401);

		// models.activities['user:follow']

		models.User.User.findById({_id: req.body._id} , {username: 1, followers: 1}, function(error, user){
			if (error) return res.send(500);
			if (!user) return res.send(404);
			if (req.body.username != user.username) return res.send(403);
			
			user.followers.push({
				_id: req.session.uid, 
				username: req.session.username
			});
			user.markModified('followers');
			user.save();

			models.User.User.update({_id: req.session.uid, username: req.session.username},
				{$push: {following: {
					_id: req.body._id,
					username: req.body.username
				}}}, 
			function(error) {
				if (error) return res.send(500);
				return res.send(200);
			});

		});
	};

	var invite = function(req, res, next) {
		if (!req.body.email || !req.body.name || !req.session || !req.session.uid ||
			!req.session.username) return res.send(401);

		models.User.Invite.create({
			username: req.session.username,
			email: req.body.email,
			name: req.body.name,
			timestamp: req.body.timestamp ? req.body.timestamp : new Date().getTime()
		}, function(error, result){
			models.User.User.update({_id: req.session.uid}, {$inc: {invitations: -1}},
				function(er, r){
					if (er) console.log(er);
				});
			emails.invites.send(req.session.username, req.body.name, req.body.email);
			if (error) return res.send(500);
			return res.send(200);
		});

	};

	return {
		login: login,
		logout: logout,
		register: register,
		me: me,
		getUser: getUser,
		patterns: patterns,
		pattern: pattern,
		follow: follow,
		invite: invite
	}
};
