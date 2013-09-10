module.exports = function(routes, app){

	app.get('/public/*', routes.index.public);

	app.get('/template/*', routes.index.template);

	app.get('/partials/*', routes.index.partials);

	app.get('/ping', routes.index.ping);

	app.get('/search', routes.index.search);

	app.get('/sounds', routes.index.sounds);

	app.get('/user/:name', routes.user.getUser);

	app.get('/pattern/:user/:id', routes.user.pattern);

	app.get('/pattern/:user', routes.user.patterns);
	
	app.get('/me', routes.user.me);

	app.get('/destroy', routes.index.destroy);

	app.get('/id', routes.index.id);

	app.post('/logout', routes.user.logout);

	app.post('/invite', routes.user.invite);

	app.post('/login', routes.user.login);

	app.post('/register', routes.user.register);

	app.post('/project', routes.project.index);

	app.put('/user/follow', routes.user.follow);

	app.get('/', routes.index.index);
	
};