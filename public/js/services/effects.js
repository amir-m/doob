define(['services/services', 'lib/effects'], function(services, effects){

	services.factory('effects', ['doobio', function(doobio){
			return effects(doobio.get(name));
		};
	}]);
	
});