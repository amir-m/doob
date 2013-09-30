module.exports = function(mongoose, models, async) {

	var _objectId = function() {
		return new Buffer((new mongoose.Types.ObjectId).toString()).toString('base64');
	};

	// defining schemas
	var SoundPatternSchema = new mongoose.Schema({
		
		_id: {type: String, required: true, unique: true},
		name: String,
		username: String,
		created: Number,
		updated: Number,
		soundsCount: {type: Number, default: 0},
		commentsCount: {type: Number, default: 0},
		likesCount: {type: Number, default: 0}, 
		forksCount: {type: Number, default: 0}, 
		isForked: {type: Boolean, default: false}, 
		forkedFrom: {},
		content: {},
		comments: []
	});

	var CommentSchema = new mongoose.Schema({
		_id: {type: String, required: true, unique: true},
    	resource: String,
    	commenter: String,
        comment: String,
    	timestamp: {type: Number, default: new Date().getTime()},
    	active: {type: Boolean, default: true}
	});

	var LikeSchema = new mongoose.Schema({
		_id: {type: String, required: true, unique: true},
    	timestamp: {type: Number, default: new Date().getTime()},
    	resource: String,
    	resourceName: String,
    	liker: String
	});

	var ForkSchema = new mongoose.Schema({
		_id: {type: String, required: true, unique: true},
		resourceId: String,
		forkedResourceId: String,
		creator: String,
		forker: String,
		timestamp: {type: Number, default: new Date().getTime()}
	});

	SoundPatternSchema.add({ active: Boolean });

	// schema settings
	SoundPatternSchema.set('autoIndex', false);
	CommentSchema.set('autoIndex', false);
	LikeSchema.set('autoIndex', false);
	ForkSchema.set('autoIndex', false);
	// SoundPatternSchema.index({
	// 	name: 1,
	// 	username: 1
	// });

	// models
	var SoundPattern = mongoose.model('SoundPattern', SoundPatternSchema);
	var Comment = mongoose.model('Comment', CommentSchema);
	var Like = mongoose.model('Like', LikeSchema);
	var Fork = mongoose.model('Fork', ForkSchema);

	var newSoundPattern = function(data, session, callbackFn) {
		
		var pattern = data.message, soundsCount = 0;

		for (var i in pattern.tracks) ++soundsCount;

		if (!pattern.name) return;

		var id = pattern.id ? pattern.id : _objectId();

		var sp = new SoundPattern({
			_id: id,
			active: true,
			name: pattern.name,
			username: session.username,
			created: data.timestamp ? data.timestamp : new Date().getTime(),
			updated: data.timestamp ? data.timestamp : new Date().getTime(),
			// soundsCount: soundsCount,
			content: {
				tempo: pattern.tempo,
				steps: pattern.steps,
				bars: pattern.bars,
				tracks: pattern.tracks
			},
			comments: []
		});

		async.waterfall([
			function(callback) {
				sp.save(function(error){
					callback(error, sp);
				});
			},
			function(sp, callback) {
				// models.User.saveSoundPattern(sp, function(error, username) {
				// 	callback(error, sp);
				// });
				models.User.User.update({_id: session.uid}, {$inc: {soundPatterns: 1}},
					function(error){
						callback(error, sp);
					});

			}
		], function(error, sp) {
			// console.log(sp)
			if (callbackFn) callbackFn(error, sp);
		});
	};

	var forkSoundPattern = function(data) {

		var pattern = data.message.content, soundsCount = 0;

		delete pattern['$$hashKey'];

		for (var i in pattern.tracks) ++soundsCount;

		var id = pattern.id ? pattern.id : _objectId();

		SoundPattern.create({
			_id: id,
			active: true,
			name: pattern.name,
			isForked: true,
			forkedFrom: data.forkedFrom,
			username: data.broadcaster,
			created: data.timestamp ? data.timestamp : new Date().getTime(),
			updated: data.timestamp ? data.timestamp : new Date().getTime(),
			soundsCount: soundsCount,
			content: {
				tempo: pattern.tempo,
				steps: pattern.steps,
				bars: pattern.bars,
				tracks: pattern.tracks,
				id: pattern.id
			},
			comments: []
		}, function (error, r) {
			
			if (error) return console.log(error);

			Fork.create({
				_id: _objectId(),
				resourceId: data.forkedFrom.id,
				forkedResourceId: pattern.id,
				creator: data.forkedFrom.username,
				forker: data.broadcaster,
				timestamp: data.timestamp
			}, function (error) {
				
				if (error) return console.log(error);

				SoundPattern.update({_id: data.forkedFrom.id}, {$inc: {
					forksCount: 1
				}}, function (error) {

					if (error) return console.log(error);

				});

				models.User.User.update({username: data.forkedFrom.username}, {$inc: {
					forkedCount: 1
				}}, function (error) {

					if (error) return console.log(error);

				});

				models.User.User.update({username: data.broadcaster}, {$inc: {
					forkingCount: 1
				}}, function (error) {

					if (error) return console.log(error);

				});

			});


		});
  	};

	var updateSoundPattern = function(data, session) {

		var pattern = data.message;

		var ts = data.timestamp ? data.timestamp : (data.message.timestamp ? data.message.timestamp : new Date().getTime());

		
		SoundPattern.update(
			{ _id: pattern.id }, { $set: { 
				'content.tracks': pattern.tracks,
				updated: ts 
			} }, 
			function(error, res) {
				if (error) return console.log(error)
			});
	};

	var changeTempo = function(data, session) {
		var pattern = data.message;
		// for (var i in pattern.tracks)
		// console.log(pattern)
		SoundPattern.update(
			{ _id: pattern.id }, { $set: { 
				'content.tempo': pattern.tempo,
				updated: new Date().getTime() 
			} }, 
			function(error, res) {
				if (error) return console.log(error)
			});
	};

	var changeSteps = function(data, session) {
		var pattern = data.message;
		// for (var i in pattern.tracks)
		// console.log(pattern)
		SoundPattern.update(
			{ _id: pattern.id }, { $set: { 
				'content.steps': pattern.steps,
				updated: new Date().getTime() 
			} }, 
			function(error, res) {
				if (error) return console.log(error)
			});
	};

	var fetchSoundPatterns = function(userid, callbackFn) {

		if (!userid || !callbackFn) return;

		SoundPattern.find({userid: userid, active: true}, callbackFn);
	};

	var newSoundPatternComment = function(data) {
    // console.log(data)
	    var id = data._id ? data._id : _objectId();

	    Comment.create({
	    	_id: id,
	    	resource: data.data.resource,
	    	commenter: data.data.commenter,
	        comment: data.data.comment,
	    	timestamp: data.timestamp
	    }, function (error, res) {
	    	if (error) console.log(error);
	    	SoundPattern.update({_id: data.data.resource}, {$push: {
		      comments: {
		      	_id: data._id,
		        timestamp: data.timestamp,
		        commenter: data.data.commenter,
		        comment: data.data.comment
		      }
		    }}, function(error){
		      if (error) console.log(error);
		    });
	    });

  	};

  	var newSPLike = function (data, callback) {
  		
  		var id = data._id || _objectId();

  		Like.create({
  			_id: id,
	    	timestamp: data.timestamp,
	    	resource: data.data.resource,
	    	resourceName: data.data.resourceName,
	    	liker: data.data.liker
  		}, function (error, res) {
  			if (error) return callback(error);
  			SoundPattern.update({_id: data.data.resource}, {$inc: {likesCount: 1}}, 
			function (error, res) {
				if (callback) return callback(error);
			});
  		});
  	};

	return {
		SoundPattern: SoundPattern,
		Like: Like,
		Fork: Fork,
		newSoundPattern: newSoundPattern,
		updateSoundPattern: updateSoundPattern,
		changeTempo: changeTempo,
		changeSteps: changeSteps,
		fetchSoundPatterns: fetchSoundPatterns,
		newSoundPatternComment: newSoundPatternComment,
		newSPLike: newSPLike,
		forkSoundPattern: forkSoundPattern
	};
};