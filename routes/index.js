module.exports = function(fs, dependencies){

	var index = function(req, res){
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
