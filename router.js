module.exports = function(routes, app){

	app.get('/public/*', routes.index.public);

	app.get('/template/*', routes.index.template);

	app.get('/partials/*', routes.index.partials);

	app.get('/ping', routes.index.ping);

	app.get('/sounds', routes.index.sounds);

	app.get('/user/:name', routes.user.getUser);

	app.post('/destroy', routes.index.destroy);

	app.post('/me', routes.user.me);

	app.post('/logout', routes.user.logout);

	app.post('/login', routes.user.login);

	app.post('/register', routes.user.register);

	app.post('/project', routes.project.index);

	app.get('/', routes.index.index);
	
};