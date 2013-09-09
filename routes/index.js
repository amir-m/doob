module.exports = function(models, sessionMaxAge, async){

	var index = function(req, res, next){
		res.set({
			'Content-type': 'text/html; charset=utf-8'
		});
		res.sendfile('views/index.html');
	};

	var public = function(req, res, next){
		res.sendfile('public/'+req.params[0]);
	};

	var template = function(req, res, next){
		res.sendfile('partials/template/'+req.params[0]);
	};

	var partials = function(req, res, next){
		res.sendfile('partials/'+req.params[0]);
	};

	// Scenario 1.
	var ping = function(req, res, next){

		// console.log(req.session)
		
		// Scenario 1. 1
		if (req.session && req.session.uid && req.session.username) {

			req.session.cookie.expires = new Date(Date.now() + sessionMaxAge);
			req.session.cookie.maxAge = sessionMaxAge;
			
			return res.send(200);
		}
		
		// Scenario 1. 2
		return res.send(401);
	};

	var destroy = function(req, res, next){
		
		if (req.session) {

			req.session.destroy(function(error){
				if (error) console.log(error);
				return res.send(200);
			});
			
		}
		
		// 
		else return res.send(400);
	};

	var sounds = function(req, res, next){
		
		models.index.Sound.find({}, function(error, results){
			
			if (error) return res.send(500);

			var r = ")]}',\n" + JSON.stringify(results);
			res.send(r);
		});
	};

	var search = function(req, res, next) {
		if (!req.session || !req.session.uid || !req.session.username) return res.send(401);
		var q = req.query.q;
		q += '*';
		async.parallel([
			function(callback) { 
				models.User.User.find({usernameLowerCase: { $regex: q, $options: 'i' }, 
					usernameLowerCase: {$ne: req.session.username.toLowerCase()} }, 
					{username: 1}, function(error, r) {
						callback(error, r);
					});
			},
			function(callback) {
				models.projects.SoundPattern.find({active: true,
					name: { $regex: q, $options: 'i' }}, 
					{name: 1, _id: 1, username: 1}, function(error, r) {
						callback(error, r);
					});
			}
		], function(error, results){
			if (error) return res.send(500);
			var r = ")]}',\n" + JSON.stringify(results);
			return res.send(r);
		});

		// models
		// setTimeout(function(){
		// 	return res.send([]);
		// 	return res.send(")]}',\n" + JSON.stringify([
		// 		[
		// 			{
		// 			username: 'KooKoo'
		// 				},{
		// 				username: 'popoooo'
		// 				}
		// 		],
		// 		[
		// 			{
		// 				name: 'dicsooo',
		// 				id: 'sjsjbsbd'
		// 				}, {
		// 				name: 'shabaaash',
		// 				id: 'smnkjsjsdjss'
		// 			}
		// 		]
		// 	]));
			
		// }, 5000);
	};

	return {
		index: index,
		public: public,
		template: template,
		partials: partials,
		ping: ping,
		destroy: destroy,
		sounds: sounds,
		search: search
	}
};
