module.exports = function(mongoose) {

	var crypto = require('crypto');

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
		activities: []
	});

	// schema settings
	UserSchema.set('autoIndex', false);
	UserSchema.index({
		name: 1,
		username: 1
	});

	// models
	var User = mongoose.model('User', UserSchema);

	var createUser = function(options, callback){

		if (!options || !options.username || !options.password) 
			if (callback) return callback({error: 400});
			else return;

		options.usernameLowerCase = options.username.toLowerCase();

		userExists(options.usernameLowerCase, function(yes){
			if (yes) 
				if (callback) return callback({error: 400});
				else return;

			// Base-64 encoding of ObjectId
			options._id = _objectId();
			options.password = _password(options.password);
			var r = options.requestor;
			delete options.requestor;

			var user = new User(options);

			user.save(function(err){
				if (err) {
					console.log('models.User.create callback error:'.error);
					return callback({error: err});
				};
				console.log('models.User.create: a user succesfully registered.'.info);
				if (callback) return callback({success: true, id: user._id});
			});

			user.logins.push(r);
			user.save();
		});
	};

	var authenticateUser = function(username, password, requestor, callback){

		User.findOne({
			usernameLowerCase: username.toLowerCase() 
		}, function(err, doc) {
			
			if (err) return callback({
				error: {
					code: 500,
					err: err
				}
			});
				
			// username is correct
			if (doc) {
				// password matches with username
				if (doc.password == crypto.createHash('sha256').update(password).digest('hex')) {
					doc.logins.push(requestor);
					doc.save();
					console.log(doc.logins.length);
					return callback({success: true, id: doc.id});
				}
				// password doesn't match with username
				else {
					console.log('badLogins')
					doc.badLogins.push(requestor);
					doc.save();
				}
			}
			
			// username doesn't exist or bad password..
			callback({error: {code: 401, err: 'Invalid username/password'}});

		});
	};

	var userExists = function(username, callback) {
		User.findOne({username: username}, function(err, doc){
			if (doc) return callback(true);
			return callback(false);
		});
	};

	var logout = function(username, requestor) {

		User.findOne({usernameLowerCase: username}, function(err, doc){

			if (err) return console.log('User.logout.ERROR: ' + err);

			if (doc) {
				doc.logouts.push(requestor);
				doc.save();
			}
		});
	};

	var me = function(username, requestor, callback) {

		if (!callback) return;

		User.findOne({usernameLowerCase: username.toLowerCase()}, function(err, doc){
			
			if (err) return callback({error: 500});
			
			if (!doc) return callback({error: 404});

			// Callback the user info
			callback({
				username: doc.username,
				lastLogIn: doc.logins[doc.logins.length - 1][date],
				activities: doc.activities
			});

			doc.getMe.push(requestor);
			doc.save();

		});
	};

	var _objectId = function() {
		return new Buffer((new mongoose.Types.ObjectId).toString()).toString('base64');
	};

	var _password = function(pass) {
		return crypto.createHash('sha256').update(pass).digest('hex');
	};

	return {
		createUser: createUser,
		authenticateUser: authenticateUser,
		logout: logout,
		me: me
	};
};