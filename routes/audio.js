module.exports = function (models, accessKeyId, secretAccessKey, AWS) { 

	var crypto = require( "crypto" ),
		bucketName = 'doob',
		maxFileSize = 2 * 1024 * 1024 * 1024, // 2GB
		minFileSize = 0,
		s3 = new AWS.S3();

	var createS3Policy = function(mimetype, username, id) {
		var s3Policy = {
			"expiration": new Date(new Date().getTime() + 1000 * 60 * 5).toISOString(),
			"conditions": [
				{ "bucket": bucketName }, 
				["starts-with", "$key", "user/"], 
				{ "acl": "public-read" }, 
				["content-length-range", minFileSize, maxFileSize],
				["eq", "$Content-Type", mimetype]
				// ["starts-with", "$Content-Disposition", ""], 
				// { "success_action_redirect": "http://example.com/uploadsuccess" }, 
				// { success_action_status: '201' } 
			]
		};

		var s3PolicyBase64 = new Buffer( JSON.stringify( s3Policy ), 'utf8' ).toString( 'base64' );
		var s3Signature = crypto.createHmac( "sha1", secretAccessKey ).update( s3PolicyBase64 ).digest( "base64" );

		var s3Credentials = {
			s3PolicyBase64: s3PolicyBase64,
			s3Signature: s3Signature,
			s3Key: accessKeyId,
			// s3Redirect: "http://example.com/uploadsuccess",
			s3Policy: s3Policy,
			postURL: 'https://'+bucketName+'.s3.amazonaws.com/',
			publicUrl: "https://s3.amazonaws.com/doob/user/"+username+"/"+id
		};

		return s3Credentials;
	}

	function upload (req, res, next) {
		
		if (!validateSession(req)) return res.send(401);

		var response = [];

		for (var i in req.body) {
			response.push(createS3Policy(req.body[i].contentType, req.session.username, req.body[i].id));
		}

		return res.send(")]}',\n" + JSON.stringify(response));
	};

	function test (req, res, next) {

		// console.log(req.query)
		// console.log(req.body)
		// console.log(req.files)

		return res.send(200);
	};

	function newAudioFile (req, res, next) {

		if (!validateSession(req)) return res.send(401);

		// https://s3.amazonaws.com/doob/user/qoi/NTI0OGNkNzcxMjNlNmRlNjFhMDAwMDA0
		/** get user's sound counts */ 
		models.User.User.findById({_id: req.session.uid}, {audioFilesCount: 1, quota: 1}, 
		function(error, user){
		
			if (error) throw error; // push the request to queue for later use.

			if ((user.quota - req.body.duration) < 0) return res.send(402);
		
			models.Audio.Audio.create({
				_id: req.body.id,
				name: req.body.name ? req.body.name : req.body.fileName.substr(0, req.body.fileName.length-4),
				username: req.session.username.toLowerCase(),
				userid: req.session.uid,
				timestamp: parseInt(req.body.timestamp),
				fileName: req.body.fileName,
				bufferLink: 'https://s3.amazonaws.com/doob/user/'+
					req.session.username.toLowerCase()+'/'+req.body.id,
				link: '/'+req.session.username.toLowerCase()+'/'+user.audioFilesCount,
				bytes: req.body.actualSize,
				fileSize: req.body.fileSize,
				fileExtension: req.body.fileName.split(".")[req.body.fileName.split(".").length - 1],
				duration: req.body.duration

			}, function (error, audio){	
				
				if (error) throw error; // push the request to queue for later use.
				// $inc audioFilesCount
				// push to activities...
				models.User.User.update({_id: req.session.uid}, {$inc: {quota: -req.body.duration}}, function (error){	
					
					if (error) throw error;

				});
				models.User.User.update({_id: req.session.uid}, {$inc: {audioFilesCount: 1}}, function (error){	
					
					if (error) throw error;

				});

				return res.send(")]}',\n" + JSON.stringify(audio));
			});
		});

	};

	function deleteAudio (req, res, next) {
		
		if (!validateSession(req)) return res.send(401);

		if (!req.param('id')) return res.send(400);

		models.Audio.Audio.update({_id: req.param('id')}, {$set: {isActive: false}}, 
		function(error){

			if (error) return res.send(500);

			var key = 'user/' + req.session.username.toLowerCase() + '/' + req.param('id');

			console.log('about to delete object from AWS...'.info);
			s3.deleteObject({
				Bucket: 'doob',
				Key: key
			}, function (error) {

				if (error) return res.send(500);

				console.log('object deleted from AWS...'.info);

				return res.send(200);
			});


		});
	};

	function audioFileLink(req, res, next) {
		
		models.Audio.Audio.find({link: req.path})
		.lean()
		.exec(function(error, audio){
			if (error) return res.send(500);
			
			if (audio.length == 0) return res.send(404);

			delete audio

			return res.send(")]}',\n" + JSON.stringify(audio));
		});
		
	};


	function validateSession(req) {

		if (!req.session || !req.session.uid || !req.session.username) {
			return false;
		}
		return true;
	};


	return {
		upload: upload,
		test: test,
		newAudioFile: newAudioFile,
		deleteAudio: deleteAudio,
		audioFileLink: audioFileLink
	}
};
