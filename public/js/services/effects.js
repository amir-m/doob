define(['services/services', 'lib/effects'], function(services, effects){

	services.factory('effects', ['doobio', function(doobio){

		// effects.subscribers = effects.subscribers || {
		// 	all: []
		// };

		// effects.publish = function(ev, options) {
		// 	var ev = ev || 'all';

		// 	if (this.subscribers[ev]) {
		// 		for (var i in this.subscribers[ev])
		// 			this.subscribers[ev][i](options);
		// 	}
		// 	// console.log(ev)
		// 	// if (ev != 'all') return;
		// 	for (var i in this.subscribers['all'])
		// 			this.subscribers['all'][i](ev, options);
		// };

		// effects.subscribe = function(ev, subscriber) {
		// 	if (!ev || (subscriber && typeof subscriber != 'function')) return;
		// 	if (typeof ev == 'function') {
		// 		var subscriber = ev;
		// 		ev = 'all';
		// 	};
		// 	if (!this.subscribers[ev]) this.subscribers[ev] = [];
		// 	this.subscribers[ev].push(subscriber);
		// };

		// effects.unsubscribe = function(ev, subscriber) {
		// 	var ev = ev || 'all';
		// 	if (typeof ev != 'string' || typeof subscriber != 'function' ||
		// 		!this.subscribers[ev]) return;
		// 	this.subscribers[ev].splice(this.subscribers[ev].indexOf(subscriber), 1);
		// };

		return function(name){
			return effects(doobio.get(name));
		};
	}]);
	
});