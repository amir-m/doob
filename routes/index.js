module.exports = function(models, sessionMaxAge){

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

	return {
		index: index,
		public: public,
		template: template,
		partials: partials,
		ping: ping,
		destroy: destroy
	}
};
