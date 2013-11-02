module.exports = function(mongoose, async, logins, models) {

	var bcrypt = require('bcrypt');
	var logins = require('../models/logins')(mongoose);


	// defining schemas
	var AudioSchema = new mongoose.Schema({

		_id: {type: String, required: true, unique: true},
		isActive: {type: Boolean, default: true},
		name: String,
		username: String,
		userid: String,
		timestamp: {type: Number, default: new Date().getTime()},
		fileName: String,
		bufferLink: String,
		link: {type: String, unique: true},
		duration: Number,
		bytes: Number,
		fileSize: String,
		fileExtension: String,
		likeCount: {type: Number, default: 0},
		forkCount: {type: Number, default: 0},
		playCount: {type: Number, default: 0},
		embedPlayCount: {type: Number, default: 0},
		uniquePlayCount: {type: Number, default: 0},
		skipCount: {type: Number, default: 0}
		remixCount, soundPatternCount
	});

	

	AudioSchema.set('autoIndex', false);

	// models
	var Audio = mongoose.model('Audio', AudioSchema);

	return {
		Audio: Audio
	};
};