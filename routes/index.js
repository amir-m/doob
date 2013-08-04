module.exports = function(fs, redisClient){

	var index = function(req, res, next){
		if (!req.uid)
			return res.sendfile('views/login.html');
		else
			return res.sendfile('views/index.html');
	};

	var public = function(req, res, next){
		res.sendfile('public/'+req.params[0]);
	};

	return {
		index: index,
		public: public
	}
};
