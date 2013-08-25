define(['services/services', 'lib/audio'], function(services, audio){

	services.factory('audio', ['doobio', function(doobio){

		audio.subscribers = audio.subscribers || {
			all: []
		};

		audio.publish = function(ev, options) {
			var ev = ev || 'all';

			if (this.subscribers[ev]) {
				for (var i in this.subscribers[ev])
					this.subscribers[ev][i](options);
			}
			// console.log(ev)
			// if (ev != 'all') return;
			for (var i in this.subscribers['all'])
					this.subscribers['all'][i](ev, options);
		};

		audio.subscribe = function(ev, subscriber) {
			if (!ev || (subscriber && typeof subscriber != 'function')) return;
			if (typeof ev == 'function') {
				var subscriber = ev;
				ev = 'all';
			};
			if (!this.subscribers[ev]) this.subscribers[ev] = [];
			this.subscribers[ev].push(subscriber);
		};

		audio.unsubscribe = function(ev, subscriber) {
			var ev = ev || 'all';
			if (typeof ev != 'string' || typeof subscriber != 'function' ||
				!this.subscribers[ev]) return;
			this.subscribers[ev].splice(this.subscribers[ev].indexOf(subscriber), 1);
		};


		return function(name) {
			
			if (!name) return;

			if (typeof name == 'string')
				return audio(doobio.get(name));
			if (typeof name == 'object') return audio(name);

			return;
		}
	}]);
	
});