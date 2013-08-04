module.exports = function(fs, redisClient){

	var index = function(req, res, next){
		if (req.session && !req.session.uid)
			return res.sendfile('views/login.html');
		else
			return res.sendfile('views/index.html');
	};

	var public = function(req, res, next){
		res.sendfile('public/'+req.params[0]);
	};

	var login = function(req, res, next) {
		
	}; 

	return {
		index: index,
		public: public,
		login: login
	}
};
