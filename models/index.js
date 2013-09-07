module.exports = function(mongoose) {

	var SoundSchema = new mongoose.Schema({
		category: String,
		sounds: []
	});

	SoundSchema.set('autoIndex', false);
	SoundSchema.index({
		category: 1	
	});

	// models
	var Sound = mongoose.model('Sound', SoundSchema);


	var getSounds = function(callbackFn) {
		
		if (!callbackFn) return;

		Sound.find({}, {category: 1, sounds:1}, function(error, sounds) {

			callbackFn(sounds);

		});
	}

	var getImpulses = function(callbackFn) {
		
		if (!callbackFn) return;

		Sound.find({"resource.soundtype": "impulse"}, function(error, sounds) {

			callbackFn(sounds);

		});
	}

	return {
		getSounds: getSounds,
		getImpulses: getImpulses,
		Sound: Sound 
	};
};