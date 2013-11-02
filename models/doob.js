module.exports = function(mongoose, async) {

	var crypto = require('crypto');

	var SoundSchema = new mongoose.Schema({

		owner_id: String,
		url: String,
		timesDownloaded: String,

	});

	// schema settings
	SessionSchema.set('autoIndex', false);
	SessionSchema.index({
		user_id: 1	
	});

	// models
	var Session = mongoose.model('Session', SessionSchema);


	var create = function(user_id, requestor, callbackFn){

		if (!callbackFn) return;

		var session = {
			uid: user_id,
			user_id: crypto.createHash('sha1').update(user_id).digest('hex'),
			deactivated: null,
			active: true,
			series: {
				id: crypto.createHash('sha1').update(_objectId()).digest('hex'),
				token: crypto.createHash('sha1').update(_objectId()).digest('hex'),
				ip: requestor.ip,
				os: requestor.OS,
				browser: requestor.browser,
				browser_version: requestor.browserVersion,
				platform: requestor.platform
			}
		};

		var new_session = new Session(session);
		new_session.save(function(error){

			callbackFn(error, session.user_id, session.series.id, session.series.token);

		});
	};

	var validate = function(user_id, series_id, token, requestor, callbackFn){

		if (!user_id || !series_id || !token || !callbackFn) return;

		// Scenario 2. 1.a.i.1
		Session.find({user_id: user_id, 'series.id': series_id, active: true}, 
		function(error, sessions) {
			
			// internal server error.
			if (error) {
				console.log(error);
				return callbackFn(500);
			}
			
			// Scenario 2. 1.a.i.2, // Scenario 2. 1.a.i.2.a
			if (sessions.length == 0) return callbackFn(null, null);
			
			// Scenario 2. 1.a.i.3
			if (sessions.length > 1) {

				// Scenario 2. 1.a.i.3.a
				sessions.forEach(function(session){
					session.active = false;
					session.series.updated = Date.now();
					session.markModified('session.series.updated');
					session.markModified('active');
					session.save();
				});

				// Scenario 2. 1.a.i.3.b
				// TODO: push a system notification for the user so that he can find that he has been 
				// probably attacked.

				// Scenario 2. 1.a.i.3.c
				return callbackFn(401);
			}

			// Scenario 2. 1.a.i.4
			var session = sessions[0];

			// Scenario 2. 1.a.i.4.a 
			session.series.updated = Date.now();
			session.series.token = crypto.createHash('sha1').update(_objectId()).digest('hex');
			session.markModified('session.series.token');
			session.markModified('session.series.updated');
			session.save(function(error){

				if (error) {
					console.log(error);
					return callbackFn(500);
				}
				callbackFn(null, {token: session.series.token, uid: session.uid});

			});
		});
	};

	var update = function(user_id, series_id, token, requestor, callbackFn) {

		if (!username || !callback) return;
		
		User.findOne({usernameLowerCase: username.toLowerCase()}, function(err, doc){
			if (doc) return callback(true);
			return callback(false);
		});
	};

	var delete_session = function(user_id, series_id, token, callbackFn) {

		if (!user_id || !series_id || !callbackFn) return;

		Session.findOne({
			user_id: user_id, 
			'series.id': series_id, 
			'series.token': token,
			active: true
		}, 
		function(error, session) {
			
			// internal server error.
			if (error) return callbackFn({error: 500, obj: error});
			
			// session doesn't exist. return 200.
			if (!session) return callbackFn(null, 200);
			
			// there should be only one session, deactivate it.
			session.active = false;
			session.deactivated = Date.now();
			session.markModified('active');
			session.markModified('deactivated');

			session.save(function(error){
				
				if (error) return callbackFn(500);
				
				// successfully deactivate session
				return callbackFn(null, 200);
			});

		});
	};

	var _objectId = function() {
		return new Buffer((new mongoose.Types.ObjectId).toString()).toString('base64');
	};

	return {
		create: create,
		validate: validate,
		update: update,
		delete_session: delete_session,
		Session: Session
	};
};