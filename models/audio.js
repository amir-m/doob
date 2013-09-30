module.exports = function(mongoose, async, logins, models) {

	var bcrypt = require('bcrypt');
	// var logins = require('../models/logins')(mongoose);


	// defining schemas
	var AudioSchema = new mongoose.Schema({

		_id: {type: String, required: true, unique: true},
		name: String,
		username: String,
		userid: String,
		fileName: String,
		bufferLink: String,
		link: String,
		bytes: Number,
		fileSize: String,
		fileExtension: String,
		likeCount: {type: Number, default: 0},
		forkCount: {type: Number, default: 0},
		playCount: {type: Number, default: 0},
		embedPlayCount: {type: Number, default: 0},
		uniquePlayCount: {type: Number, default: 0},
		skipCount: {type: Number, default: 0}
		// remixCount, soundPatternCount
	});

	

	AudioSchema.set('autoIndex', false);
	// AudioSchema.index({
	// });

	// models
	var Audio = mongoose.model('Audio', AudioSchema);

	return {
		Audio: Audio
	};
};