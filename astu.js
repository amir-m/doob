/**
*   Add a Settings Model for All Users.
*/
var mongoose = require('mongoose');

if (process.env.MONGOLAB_URI)
  var mg = process.env.MONGOLAB_URI;//require("url").parse(process.env.MONGOLAB_URI);
else
  var mg = "mongodb://localhost/doob";

var users = require('./models/User')(mongoose);

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
    
    users.User.find({}, function(err, docs){
        console.log(docs.length);
        for (var i = 0; i < docs.length; ++i) {
            var s = new users.Settings({
                _id: new Buffer((new mongoose.Types.ObjectId).toString()).toString('base64'),
                userid: docs[i]._id,
                updated: new Date().getTime()
            });

            s.save();
        }
    });

    // users.Settings.find({}, function(err, docs){
    //         console.log(docs)
    //     });
	
});








