define(['services/services', 'lib/sequencer'], function(services, sequencer){

	services.factory('sequencer', ['doobio', function(doobio){

		sequencer.subscribers = sequencer.subscribers || {
			all: []
		};

		sequencer.publish = function(ev, options) {
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

		sequencer.subscribe = function(ev, subscriber) {
			if (!ev || (subscriber && typeof subscriber != 'function')) return;
			if (typeof ev == 'function') {
				var subscriber = ev;
				ev = 'all';
			};
			if (!this.subscribers[ev]) this.subscribers[ev] = [];
			this.subscribers[ev].push(subscriber);
		};

		sequencer.unsubscribe = function(ev, subscriber) {
			var ev = ev || 'all';
			if (typeof ev != 'string' || typeof subscriber != 'function' ||
				!this.subscribers[ev]) return;
			this.subscribers[ev].splice(this.subscribers[ev].indexOf(subscriber), 1);
		};

		return function(name){
			return sequencer(doobio.get(name));
		};
	}]);
	
});