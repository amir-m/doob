module.exports = function (models, accessKeyId, secretAccessKey) { 

	var crypto = require( "crypto" ),
		bucketName = 'doob',
		maxFileSize = 2 * 1024 * 1024 * 1024, // 2GB
		minFileSize = 0; 

	var createS3Policy = function(mimetype, username) {
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
			postURL: 'https://'+bucketName+'.s3.amazonaws.com/'
		};

		return s3Credentials;
	}

	function upload (req, res, next) {
		
		if (!validateSession(req)) return res.send(401);

		var response = [];

		for (var i in req.body) {
			response.push(createS3Policy(req.body[i].contentType, req.username));
		}

		return res.send(")]}',\n" + JSON.stringify(response));
	};

	function test (req, res, next) {

		console.log(req.query)
		console.log(req.body)
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
			models.Audio.Audio.create({
				_id: req.body.id,
				name: req.body.name ? req.body.name : req.body.fileName,
				username: req.session.username,
				userid: req.session.uid,
				fileName: req.body.fileName,
				bufferLink: 'https://s3.amazonaws.com/doob/user/'+req.session.username+'/'+req.body.id,
				link: 'http://doob.io/'+req.session.username+'/'+user.audioFilesCount,
				bytes: req.body.actualSize,
				fileSize: req.body.fileSize,
				fileExtension: req.body.fileName.split(".")[req.body.fileName.split(".").length - 1]
			}, function (error){	
				if (error) throw error; // push the request to queue for later use.
				// $inc audioFilesCount
				// push to activities...
				models.User.User.update({_id: req.session.uid}, {$inc: {quota: -req.body.actualSize}}, function (error){	
					if (error) throw error;
				});
				models.User.User.update({_id: req.session.uid}, {$inc: {audioFilesCount: 1}}, function (error){	
					if (error) throw error;
				});

				return res.send(200);
			});
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
		newAudioFile: newAudioFile
	}
};
