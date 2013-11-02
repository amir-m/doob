module.exports = function(mongoose, async, logins, models) {

	var bcrypt = require('bcrypt');
	var logins = require('../models/logins')(mongoose);


	// defining schemas
	var UserSchema = new mongoose.Schema({
		_id: {type: String, required: true, unique: true},

		// Profile
		username: {type: String, required: true, unique: true},
		email: {type: String, required: true, unique: true},
		usernameLowerCase: {type: String, required: true, unique: true},
		password: {type: String, required: true},

		// Request Trackers
		logins: [],
		logouts: [],

		// Activities
		activities: [],

		// Social
		followers: [],
		following: [],

		subscribers: [],
		subscribedTo: [],

		// Instroments
		projects : {
			id: String,
			name: String
		},
		soundPatterns: {type: Number, default: 0},
		invitations: {type: Number, default: 0},
		audioFilesCount: {type: Number, default: 0},
		forkingCount: {type: Number, default: 0},
		forkedCount: {type: Number, default: 0},
		accType: {type: Number, default: 1},
		quota: {type: Number, default: 10 * (1024*1024*1024)}

	});

	SettingsSchema = new mongoose.Schema({
		_id: {type: String, required: true, unique: true},
		userid: String,
		usernameLowerCase: String,
		updated: Number,
		notifications: {
			messages: {type: Boolean, default: true},

			new_follower: {type: Boolean, default: true},

			new_projects: {type: Boolean, default: true},

			updates_projects: {type: Boolean, default: true}
		}
	});

	InviteSchema = new mongoose.Schema({
		username: String,
		name: String,
		email: String,
	});

	// schema settings
	UserSchema.set('autoIndex', false);
	UserSchema.index({
		name: 1,
		username: 1
	});

	SettingsSchema.set('autoIndex', false);
	SettingsSchema.index({
		userid: 1,
		username: 1
	});

	// models
	var User = mongoose.model('User', UserSchema);

	var Invite = mongoose.model('Invite', InviteSchema);

	var Settings = mongoose.model('Settings', SettingsSchema);

	var createUser = function(options, callbackFn){

		if (!options || !options.username || !options.password || !options.email) 
			if (callbackFn) return callbackFn({error: 400});
			else return;

		options.usernameLowerCase = options.username.toLowerCase();
		// Base-64 encoding of ObjectId
		options._id = _objectId();
		var r = options.requestor;
		delete options.requestor;
		
		options.subscribers = options.subscribers || [];
		options.subscribedTo = options.subscribedTo || [];
		options.followers = options.followers || [];
		options.following = options.following || [];
		options.soundPatterns = options.soundPatterns || 0;


		async.waterfall([
			function(callback){
				// check if the user exists
				userExists(options.usernameLowerCase, function(yes) {
					callback(null, yes);
				});
			},	
			function(userExist, callback) {

				// the user already exists, call the callback function with error code 400 
				if (userExist) callback({error: 400});
				// user does not exist, proceed to next function
				else callback(null);
			}, 
			function(callback) {

				// get salt from bcrypt
				bcrypt.genSalt(10, function(err, salt) {
					callback(err, salt);
				});
			}, 
			function(salt, callback) {
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
					} else {
						console.log('models.User.create: a user succesfully registered.'.info);
						user.logins.push(r);
						user.save();
						callback(null, user);
					}
				});
			},
			function(user, callback) {
				// create a new user
				var settings = new Settings({
					_id: _objectId(),
					userid: user._id,
					username: user.username,
					updated: new Date().getTime()
				});

				settings.save(function(err){
					if (err) {
						console.log('models.User.create setting saving error:'.error);
						callback(err)
					} else {
						console.log('models.User.create: settings for the user created.'.info);
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

			// Scenario 2. 2.a
			function(matched, user, callback) {

				// Scenario 2. 2.a.i
				// User can't be authenticated
				if (!matched) {

					logins.badLogin(user._id, requestor);
					callback({error: {code: 401, err: 'Invalid username/password'}});
				} else {

					logins.successfulLogin(user._id, requestor);
					callback(null, {success: true, id: user.id, username: user.username});
				}
			}
		],
		function(error, result) {
			if (callbackFn) callbackFn(error, result)
		});
	};

	var changePassword = function(username, password, newPassword, requestor, callbackFn){

		async.waterfall([
			function(callback) {
				User.findOne({
					usernameLowerCase: username.toLowerCase() 
				}, function(error, user) {
					callback(error, user);
				});
			},
			function(user, callback) {

				if (!user) {
					callback(401);
				} 
				else
					bcrypt.compare(password, user.password, function(error, result) {
    					callback(error, result, user);
					});
			}, 

			function(matched, user, callback) {

				if (!matched) callback(401);

				else

					bcrypt.genSalt(10, function(err, salt) {
						callback(err, salt, user);
					});
			},

			function(salt, user, callback) {
				
				bcrypt.hash(newPassword, salt, function(err, hash) {
					user.password = hash;
					callback(err, user);
				});
			},

			function(user, callback) {
				user.save(function(error){
					if (error) callback(error);
					else callback(null, 200);
				});
			}
		],
		function(error, result) {
			if (callbackFn) callbackFn(error, result)
		});
	};

	var changeEmail = function(username, password, email, requestor, callbackFn){

		async.waterfall([
			function(callback) {
				User.findOne({
					usernameLowerCase: username.toLowerCase() 
				}, function(error, user) {
					callback(error, user);
				});
			},
			function(user, callback) {

				if (!user) {
					callback(401);
				} 
				else
					bcrypt.compare(password, user.password, function(error, result) {
    					callback(error, result, user);
					});
			}, 

			function(matched, user, callback) {

				if (!matched) callback(401);

				else

					User.findOne({email: email}, function(error, result){
						callback(error, result, user)
					});
			},

			function(emailExist, user, callback) {
				
				if (emailExist) callback(409);
				else callback(null, user);
			},

			function(user, callback) {

				user.email = email;
				user.markModified = "email";
				
				user.save(function(error){
					if (error) callback(error);
					else callback(null, 200);
				});
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

	var me = function(id, requestor, fields, callback) {

		if (!callback) return;

		var c = 0, f = {};

		for (var i in fields) {
			++c;
			if (c > 0) break;
			if (i != 'password' && i != '_id') f[i] = fields[i];
		}

		if (c == 0) fields['password'] = 0;

		User.findById({_id: id}, fields, function(err, user){

			if (err) {
				console.log(err)
				return callback({error: 500});
			}

			if (!user) return callback(401);

			callback(null, user);
		});
	};

	var follow = function(me, userIwantToFollow, callbackFn) {
		
		// follow another user

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

		// stop following another user (userIwantToUnfollow)

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
		User.findOne({usernameLowerCase: name.toLowerCase()}, 
			{username: 1, followers: 1, following: 1, soundPatterns: 1, audioFilesCount: 1})
		.lean()
		.exec(function(error, user) {
			
			if (error) {
				console.log(error);
				return callback(error);
			}

			models.activities.Activity.find({userId: user._id}, function(e, a){
				
				if (e) console.log(e)
					
					models.Audio.Audio.find({username: name.toLowerCase()})
					.sort({timestamp: -1})
					.where('username', name)
					.limit(20)
					.lean()
					.exec(function (error, result) {
						
						if (error) return console.log(error);
						user.audio = result;
						user.audioSkip = 20;
						callback(user);
					});

				models.Audio.Audio
				.where('username', name)
				.count(function (error, c) {
					if (error) return console.log(error);
					user.audioCount = c;
				});
				

			});
		});
	};

	var _objectId = function() {
		return new Buffer((new mongoose.Types.ObjectId).toString()).toString('base64');
	};

	var insertActivity = function(id, actv, broadcaster) {
		
		User.findById({_id: id}, {followers: 1}, function(error, user){

			var t = [];

			for (var i = 0; i < user.followers.length; ++i) 
				if (user.followers[i]._id)
					t.push(user.followers[i]._id)
				

			User.find({_id: {$in: t}}, function (error, followers) {
				if (error) throw error;
				for (var i = 0; i < followers.length; ++i) {
					followers[i].activities.push({
						id: actv._id,
						text: actv.text,
						vars: actv.vars,
						username: actv.username,
						timestamp: actv.timestamp
					});
					followers[i].activities.splice(0, followers[i].activities.length - 15);
					followers[i].markModified('activities');
					followers[i].save(function (error) {
						if (error) throw error;
					});
				}
			});	
			
		});
	};

	var saveSoundPattern = function(sp, callbackFn) {
		User.findById(sp.userid, function(error, user){
			if (error) return callbackFn ? callbackFn(error) : '';
			if (!user) return callbackFn ? callbackFn('User Not Found!') : '';

			user.soundPatterns.push({
				id: sp._id,
				name: sp.name,
				sounds: sp.sounds,
				created: sp.created,
				updated: sp.updated
			});

			user.markModified('soundPatterns');
			user.save(function(error){

				if (callbackFn) return callbackFn(error, user.username);
			});
		})
	};

	return {
		User: User,
		Invite: Invite,
		Settings: Settings,
		createUser: createUser,
		authenticateUser: authenticateUser,
		logout: logout,
		me: me,
		follow: follow,
		unFollow: unFollow,
		getUser: getUser,
		insertActivity: insertActivity,
		saveSoundPattern: saveSoundPattern,
		changePassword: changePassword,
		objectId: _objectId,
		changeEmail: changeEmail
	};
};