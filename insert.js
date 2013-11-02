/**
* insert file!
*/
var mongoose = require('mongoose'), fs = require('fs');

if (process.env.MONGOLAB_URI)
  var mg = process.env.MONGOLAB_URI;
else
  var mg = "mongodb://localhost/doob";

var models = require('./models/index')(mongoose);

mongoose.connect(mg, function(err){
    if (err) throw err;
    console.log('connected to mongoDB: %s', mg);

	fs.readFile('./helper/sounds.js', 'utf8', function (err, data) {
		if (err) throw err;
		models.Sound.create(JSON.parse(data), function(err) {
			if (err) throw err;
			console.log('finished!');
		});	
    });
});








