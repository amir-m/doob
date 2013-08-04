module.exports = function(fs, redisClient){

	var index = function(req, res, next){
		return res.sendfile('views/login.html');
	};

	var public = function(req, res, next){
		res.sendfile('public/'+req.params[0]);
	};

	return {
		index: index,
		public: public
	}
};
