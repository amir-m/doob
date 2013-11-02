module.exports = function(mongoose, async) {

	// This Schema holds all unsuccessful login
	var BadLoginsSchema = new mongoose.Schema({

		// User Id of the user who had an unsuccessful login
		user_id: {type: String, required: true},
		timestamp: { type: Date, default: Date.now },

		// info about the system who generates the bad login.
		requestor: {}
	});

	// schema settings
	BadLoginsSchema.set('autoIndex', false);
	BadLoginsSchema.index({
		user_id: 1	
	});

	var BadLogins = mongoose.model('BadLogins', BadLoginsSchema);


	// This Schema holds all successful login
	var SuccessfulLoginsSchema = new mongoose.Schema({

		// User Id of the user who had an successful login
		user_id: {type: String, required: true},
		timestamp: { type: Date, default: Date.now },
		requestor: {}

	});

	// schema settings
	SuccessfulLoginsSchema.set('autoIndex', false);
	SuccessfulLoginsSchema.index({
		user_id: 1	
	});

	var SuccessfulLogins = mongoose.model('SuccessfulLogins', SuccessfulLoginsSchema);

	// returns times number of latest badLogins e.g. times = 10, returns last 10 badlogins
	var badLogins = function(user_id, times, callbackFn) {};

	// returns times number of latest successfulLogins 
	var successfulLogins = function(user_id, times, callbackFn) {};

	// creates a new badLogin document.
	var badLogin = function(user_id, requestor, callbackFn) {
		
		b = new BadLogins({
			user_id: user_id,
			timestamp: Date.now(),
			requestor: requestor
		});

		b.save(function(error){
			if (callbackFn) callbackFn(error);
		});

	};

	// creates a new successfulLogin document.
	var successfulLogin = function(user_id, requestor, callbackFn) {
		
		s = new SuccessfulLogins({
			user_id: user_id,
			timestamp: Date.now(),
			requestor: requestor
		});

		s.save(function(error){
			if (callbackFn) callbackFn(error);
		});

	};

	return {
		badLogins: badLogins,
		successfulLogins: successfulLogins,
		badLogin: badLogin,
		successfulLogin: successfulLogin
	};
};