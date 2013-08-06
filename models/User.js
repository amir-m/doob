module.exports = function(mongoose) {

	var crypto = require('crypto');

	// defining schemas
	var UserSchema = new mongoose.Schema({
		_id: {type: String, required: true, unique: true},
		username: {type: String, required: true, unique: true},
		password: {type: String, required: true}
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

		userExists(options.username, function(yes){
			if (yes) 
				if (callback) return callback({error: 400});
				else return;

			// Base-64 encoding of ObjectId
			options._id = _objectId();
			options.password = _password(options.password);

			var user = new User(options);

			user.save(function(err){
				if (err) {
					console.log('models.User.create callback error:'.error);
					return callback({error: err});
				};
				console.log('models.User.create: a user succesfully registered.'.info);
				if (callback) return callback({success: true, id: user._id});
			});
		});
	};

	var authenticateUser = function(username, password, callback){

		User.findOne({
			username: username,
			password: crypto.createHash('sha256').update(password).digest('hex')
		}, function(err, doc) {
			
			if (err) return callback({
				error: {
					code: 500,
					err: err
				}
			});
				
			if (doc) return callback({success: true, id: doc.id});
			
			callback({error: {code: 401, err: 'Invalid username/password'}});

		});
	};

	var userExists = function(username, callback) {
		User.findOne({username: username}, function(err, doc){
			if (doc) return callback(true);
			return callback(false);
		});
	};

	var _objectId = function() {
		return new Buffer((new mongoose.Types.ObjectId).toString()).toString('base64');
	};

	var _password = function(pass) {
		return crypto.createHash('sha256').update(pass).digest('hex');
	};

	return {
		User: User,
		createUser: createUser,
		authenticateUser: authenticateUser,
		userExists: userExists
	};
};