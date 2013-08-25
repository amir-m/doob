module.exports = function(){

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

	var ping = function(req, res, next){

		console.log(req.host)
		console.log(req.protocol)

		if (req.session && req.session.uid && req.session.username) return res.send(200);
		
		return res.send(401);
	};

	return {
		index: index,
		public: public,
		template: template,
		partials: partials,
		ping: ping
	}
};
