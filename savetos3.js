var AWS = require('aws-sdk');
var fs = require('fs');
var base = './public/wav/';
var folders = ['clap', 'hat', 'impulses', 'kick', 'snare', 'tom'];

AWS.config.loadFromPath('./aws.json');

var s3 = new AWS.S3(); 
 
for (var j = 0; j < folders.length; ++j) {

	
	(function (foldername) {

		fs.readdir(base + foldername, function (error, files) {

			if (error) throw error;

			for (var i in files) 

				(function (filename, foldername) {

					fs.readFile(base + foldername + '/' + filename, function (error, data) {

						if (error) throw error;

						var req = s3.putObject({
							Bucket: 'doob',
							Body: data,
							Key: 'Amir/' + foldername + '/' + filename,
							Metadata: {
								'Content-Type': 'audio/vnd.wav'
							}
						});
						req.send(function (e) {
							if (e) throw e;

							console.log('Amir/' + foldername + '/' + filename + '\tDone!');
						});						

					});

				} (files[i], foldername));

		})

	}(folders[j]));
	
}

