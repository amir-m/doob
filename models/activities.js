module.exports = function(mongoose, models, async) {
	
	var ActivitySchema = new mongoose.Schema({
		_id: {type: String, required: true, unique: true},
		userId: String,
		username: String,
		text: String,
		timestamp: {type: Number, default: new Date().getTime()},
		visibility: {type: String, default: 'public'}
	});

	ActivitySchema.set('autoIndex', false);

	var Activity = mongoose.model('Activity', ActivitySchema);

	var _objectId = function() {
		return new Buffer((new mongoose.Types.ObjectId).toString()).toString('base64');
	};

	var User = models.User.User;

	var handleActivity = function(data, session) {
			// find broadcaster's model.

		var a = new Activity({
			_id: _objectId(),
			userId: session.uid,
			username: session.username,
			text: models.activityMessages[data.event](data),
			timestamp: data.timestamp ? data.timestamp : new Date().getTime()
		});

		a.save(function(error) {
			if (error) console.log('error saving activity!'.error);
			models.User.insertActivity(session.uid, a, data.broadcaster);
		});

		// console.log(data.event);
	}

	return {
		Activity: Activity,
		'user:broadcast:start': handleActivity,
		'user:broadcast:stop': handleActivity,
		'new:sequencer:SoundPattern': handleActivity,
		'update:sequencer:SoundPattern:newTrack': handleActivity,
		// 'user:subscribe': handleActivity,
		// 'user:unsubscribe': handleActivity, // Maybe NOT!
		// 'new:aduio:Sound': handleActivity, 
		// 'update:sequencer:SoundPattern:newTrack': handleActivity,
		// 'update:sequencer:SoundPattern:removeTrack': handleActivity,
	};
};