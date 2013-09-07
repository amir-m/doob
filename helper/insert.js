var mongoose = require('mongoose'), fs = require('fs');

if (process.env.MONGOLAB_URI)
  var mg = process.env.MONGOLAB_URI;//require("url").parse(process.env.MONGOLAB_URI);
else
  var mg = "mongodb://localhost/doob";

var models = require('/apps/hm/models/index')(mongoose);

mongoose.connect(mg, function(err){
    if (err) throw err;
    console.log('connected to mongoDB: %s', mg);

    // var x = {
    // 	resource: {
    // 		name: "A_CLAP_1",
    // 		type: "sound",
    // 		url: "/public/wav/CLAP/A_CLAP_1.wav"
    // 	}
    // };

    // var s = new models.Sound(x);

    // s.save(function(err) {
    // 	if (err) throw err;
    // 	console.log('finished!');

    	// models.Sound.find({}, function(err, docs){
    	// 	console.log(docs)
    	// })
    // });

	fs.readFile('/apps/hm/helper/sounds.js', 'utf8', function (err, data) {
		if (err) throw err;
		models.Sound.create(JSON.parse(data), function(err) {
			if (err) throw err;
			console.log('finished!');
		});
		// console.log(JSON.parse(data))
	});
});








