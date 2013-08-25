module.exports = function(mongoose, async) {

	var bcrypt = require('bcrypt');


	// defining schemas
	var UserSchema = new mongoose.Schema({
		_id: {type: String, required: true, unique: true},

		// Profile
		username: {type: String, required: true, unique: true},
		usernameLowerCase: {type: String, required: true, unique: true},
		password: {type: String, required: true},

		// Request Trackers
		logins: [],
		badLogins: [],
		logouts: [],
		getMe: [],

		// Activities
		activities: [],

		// Social
		followers: [],
		following: []

		// Instroments

	});

	// schema settings
	UserSchema.set('autoIndex', false);
	UserSchema.index({
		name: 1,
		username: 1
	});

	// models
	var User = mongoose.model('User', UserSchema);


	var createUser = function(options, callbackFn){

		if (!options || !options.username || !options.password) 
			if (callbackFn) return callbackFn({error: 400});
			else return;

		options.usernameLowerCase = options.username.toLowerCase();
		// Base-64 encoding of ObjectId
		options._id = _objectId();
		var r = options.requestor;
		delete options.requestor;


		async.waterfall([
			function(callback){
				// check if the user exists
				userExists(options.usernameLowerCase, function(yes) {
					console.log('---inside async.1.userExist---'.info);
					callback(null, yes);
				});
			},	
			function(userExist, callback) {
				console.log('---inside async.2---'.info);

				// the user already exists, call the callback function with error code 400 
				if (userExist) callback({error: 400});
				// user does not exist, proceed to next function
				else callback(null);
			}, 
			function(callback) {
				// set password.
				console.log('---inside async.3---'.info);


				// get salt from bcrypt
				bcrypt.genSalt(10, function(err, salt) {
					callback(err, salt);
				});
			}, 
			function(salt, callback) {
				console.log('---inside async.4---'.info);
				// get password hash from salt
				bcrypt.hash(options.password, salt, function(err, hash) {
					options.password = hash;
					callback(err);
				});
			},
			function(callback) {
				// create a new user
				var user = new User(options);

				user.save(function(err){
					if (err) {
						console.log('models.User.create callbackFn error:'.error);
						callback(err)
						// return callbackFn({error: err});
					} else {
						console.log('models.User.create: a user succesfully registered.'.info);
						user.logins.push(r);
						user.save();
						callback(null, {success: true, id: user._id});
					}
				});
			}

		], function(error, result) {
			// last function
			if (callbackFn) callbackFn(error, result); 
		});
	};

	var authenticateUser = function(username, password, requestor, callbackFn){

		if (!username || !password) 
			
			if (callbackFn && typeof callbackFn == 'function') 
				return callbackFn({
					error: {
						code: 400,
						err: 'Username and Password are required!'
					}
				});

			else return;

		async.waterfall([
			function(callback) {
				// check if the user exists.
				User.findOne({
					usernameLowerCase: username.toLowerCase() 
				}, function(error, user) {
					callback(error, user);
				});
			},
			function(user, callback) {
				// username doesn't exist or bad password..		
				if (!user) {
					callback({error: {code: 401, err: 'Invalid username/password'}});
				} 
				else
					// compare the user's password to the supplied password
					bcrypt.compare(password, user.password, function(error, result) {
    					callback(error, result, user);
					});
			}, 
			function(matched, user, callback) {
				if (!matched) {
					user.badLogins.push(requestor);
					user.save();
					callback({error: {code: 401, err: 'Invalid username/password'}});
				} else {
					user.logins.push(requestor);
					user.save();
					callback(null, {success: true, id: user.id, username: user.username});
				}
			}
		],
		function(error, result) {
			if (callbackFn) callbackFn(error, result)
		});
	};

	var userExists = function(username, callback) {

		if (!username || !callback) return;
		
		User.findOne({usernameLowerCase: username.toLowerCase()}, function(err, doc){
			if (doc) return callback(true);
			return callback(false);
		});
	};

	var logout = function(id, requestor, callback) {

		User.findOne({_id: id}, function(err, doc){

			if (err) return console.log('User.logout.ERROR: ' + err);

			if (doc) {
				doc.logouts.push(requestor);
				doc.save();
				callback(doc.username);
			}
		});
	};

	var me = function(id, requestor, callback) {

		if (!callback) return;

		User.findOne({_id: id}, function(err, doc){
			
			if (err) return callback({error: 500});
			
			if (!doc) return callback({error: 404});

			var res = {
				username: doc.username,
				activities: doc.activities
			};

			if (doc.logins.length > 0) res.lastLogIn = doc.logins[doc.logins.length - 1]['date'];

			// Callback the user info
			callback(res);

			doc.getMe.push(requestor);
			doc.save();

		});
	};

	var follow = function(me, userIwantToFollow, callbackFn) {
		
		// i want to follow another user

		if (!me || !userIwantToFollow) return callbackFn(404);

		async.waterfall(
		[
			function(callback) {
				User.findOne({
					usernameLowerCase: me.toLowerCase() 
				}, function(error, _me){
					callback(error, _me);
				});
			},
			function(_me, callback) {
				User.findOne({
					usernameLowerCase: userIwantToFollow.toLowerCase() 
				}, function(error, _userIwantToFollow) {
					callback(error, _userIwantToFollow, _me);
				});
			}, 
			function(_userIwantToFollow, _me, callback) {
				_me.following.push(userIwantToFollow);
				_userIwantToFollow.followers.push(me);
				_me.save();
				_userIwantToFollow.save();
				callback(null, 200);
			}
		],
		function(error, result) {
			if (callbackFn) callbackFn(error, result);
		});
	};

	var unFollow = function(me, userIwantToUnfollow, callback) {

		// i want to stop following another user (userIwantToUnfollow)

		if (!me || !userIwantToUnfollow) return callbackFn(404);

		async.waterfall(
		[
			function(callback) {
				User.findOne({
					usernameLowerCase: me.toLowerCase() 
				}, function(error, _me){
					callback(error, _me);
				});
			},
			function(_me, callback) {
				User.findOne({
					usernameLowerCase: userIwantToUnfollow.toLowerCase() 
				}, function(error, _userIwantToUnfollow) {
					callback(error, _userIwantToUnfollow, _me);
				});
			}, 
			function(_userIwantToUnfollow, _me, callback) {
				_me.following.splice(_me.following.indexOf(userIwantToUnfollow), 1);
				_userIwantToUnfollow.followers.splice(_userIwantToUnfollow.followers.indexOf(me), 1);
				_me.save();
				_userIwantToUnfollow.save();
				callback(null, 200);
			}
		],
		function(error, result) {
			if (callbackFn) callbackFn(error, result);
		});
	};

	var getUser = function(name, callback) {
		User.findOne({usernameLowerCase: name.toLowerCase()}, ['username', 'followers', 'following']
		, function(error, user) {
			callback(user);
		});
	};

	var _objectId = function() {
		return new Buffer((new mongoose.Types.ObjectId).toString()).toString('base64');
	};

	return {
		User: User,
		createUser: createUser,
		authenticateUser: authenticateUser,
		logout: logout,
		me: me,
		follow: follow,
		unFollow: unFollow,
		getUser: getUser
	};
};