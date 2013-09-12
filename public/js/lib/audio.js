define([], function () {

	return function(doob, io){

		return (function invocation(doob, io){

			var sourceQueue = {},
				// soundBank = {},
				events = ['new:aduio:Sound'],
				subscribers = {
					all: []
				};
			var publish = function(ev, s, p) {
		        var ev = ev || 'all';

		        var args = arguments;

		        // console.log(args)

		        if (subscribers[ev]) {
		            for (var i in subscribers[ev])
		                subscribers[ev][i].apply(ev, args);
		        }
		        // console.log(ev)
		        if (ev == 'all') return;
		        for (var i in subscribers['all'])
		                subscribers['all'][i].apply(ev, args);
		    };

		    var subscribe = function(ev, subscriber) {

		        if (!ev || (subscriber && typeof subscriber != 'function')) return;
		        if (typeof ev == 'function') {
		            var subscriber = ev;
		            ev = 'all';
		        };
		        if (!subscribers[ev]) subscribers[ev] = [];
		        subscribers[ev].push(subscriber);
		    };

		    var unsubscribe = function(ev, subscriber) {
		        var ev = ev || 'all';
		        if (typeof ev != 'string' || typeof subscriber != 'function' ||
		            !subscribers[ev]) return;
		        subscribers[ev].splice(subscribers[ev].indexOf(subscriber), 1);
		    };

			var createSource = function(config) {
				// console.log(sound)
				if (!config || !config.buffer || !config.destination) 
					throw 'audio.createSource : Not enough arguments.';
				var source = doob.context.createBufferSource();
				source.buffer = config.buffer;
				source.connect(config.destination);
				return source;
			};

			var playSound = function (sound, time) {
				if (!sound) return {'playSound':'Invalid arguments.'};
				time = time || 0;
				var source = createSource({
					buffer 		: sound.buffer, 
					destination : sound.graph ? sound.graph.source : sound.destination
				});
				if (source.start)
					source.start(doob.context.currentTime+time);
				else if (source.noteOn)
					source.noteOn(doob.context.currentTime+time);
				else throw 'audio:playSound Bad Source!'
				// return source;
			};

			var stopSound = function(sound) {
				if (!sound || !sound instanceof audio.Sound) return;
				if (sourceQueue[sound.name]) {
					for (var i = 0, l = sourceQueue[sound.name].length; i < l; ++i)
						sourceQueue[sound.name][i].stop(0);
				}
				// dispatchEvent[stop]..			
			};

			var duplicateSound = function(sound, duplicateName){
				var config = {};
				for (var prop in doob.assets[sound])
					if (doob.assets[sound].hasOwnProperty(prop))
						config[prop] = doob.assets[sound][prop];

				config.name = duplicateName;
				config.isDummy = true;
				
				delete config['gain'];
				delete config['graph'];



				doob.dummyNodes[duplicateName] = Sound(config);
				
				// remove the dummy name!
				// doob.sounds.splice(doob.sounds.indexOf(duplicateName), 1);

				return doob.dummyNodes[duplicateName];
			}

			var Sound = function (sound, pub) {

				var self = this, buf, isL;
			
				if (!sound || !sound.url)  {
					throw 'audio.Sound : Invalid Sound arguments.';
				}
				sound.name = sound.name || doob.uniqueNames.Sound;

				// if (doob.sounds.indexOf(sound.name) != -1) return doob.sounds[sound.name];

				var properties = {
					// Queues for onload, onloadind, onload, onfinishplaying & onstop events.
					// Functions will be triggered based on their registration order.
					id: {
						value: sound.id,
						enumerable: true, writable: true, configurable: false
					},
					name: {
						value: sound.name,
						enumerable: true, writable: true, configurable: false
					}, url: {
						value: sound.url,
						enumerable: true, writable: true, configurable: false
					}, isLoaded: {
						value: false, enumerable: true, writable: true, configurable: false
					}, isDummy: {
						value: sound.isDummy || false, 
						enumerable: true, writable: true, configurable: false
					}, buffer: {
						value: null, 
						enumerable: true, writable: true, configurable: false
					}, gain:{
						value: sound.gain || new io.Gain({
							name: sound.gainName || sound.name + '_gain',
							belongsTo: sound.name
						}),
						enumerable: true, writable: true, configurable: false
					}, graph: {
						value: sound.graph || null,
						enumerable: true, writable: false, configurable: false
					}, play: {
						value: function(t) {
													
							return playSound(this, t);
							
						}
					}, stop: {
						value: function(id){
							if (sourceQueue && sourceQueue[id]) {
								sourceQueue[id].stop(0);
							}
						}					
					}, playState: {
						value: false, 
						enumerable: true, writable: true, configurable: false					
					}
				}
				
				if (!sound.graph)
					
					var graphConfig = {
						belongsTo: sound.name,
						source: properties.gain.value,
						connectable: properties.gain.value.connectable,
						destination: sound.destination || doob.masterGain,
						node: properties.name.value
					};
					
					if (sound.graphName) 
						graphConfig[name] = sound.graphName;

					properties.graph.value = new io.Graph(graphConfig);
							
				// Invoked as a constructor.
				if (this instanceof Sound) {
					Object.defineProperties(this, properties);
					// this.constructor = 'Sound';
					// this.subscribers = {
					// 	'all': []
					// };

					// subscribe('new:aduio:Sound', doob.handlers['new:aduio:Sound']);

					// publish('new:aduio:Sound', this);


					// // soundBank[this.name] = this;
					// sourceQueue[this.name] = [];
					// doob.assets[sound.name] = this;	
					// doob.assetsToJSON[this.name] = this.toJSON();
					// doob.sounds.push(this.name);

					

					// this.load();

					// soundBank[this.name] = o;
					this.constructor = 'Sound';

					publish('new:aduio:Sound', this, pub);

					sourceQueue[this.name] = [];
					
					this.load();
				}
				// Invoked as a factory function.
				else {
					var o = Object.create(Sound.prototype, properties); 
					// soundBank[this.name] = o;
					o.constructor = 'Sound';

					publish('new:aduio:Sound', o, pub);

					sourceQueue[this.name] = [];
					
					o.load();
					return o;
				}
			};	
			Sound.prototype.load = function() {
				var self = this;
				doob.loadBuffer({
					url: this.url, 
					load: function(buffer){
						self.buffer = buffer;
						self.isLoaded = true;									
					}
				});
			}
			Sound.prototype.insert = function() {
				this.graph.insert(arguments);
			};
			Sound.prototype.unInsert = function() {
				this.graph.remove(arguments);
			};
			Sound.prototype.send = function() {
				this.graph.addSend(arguments);
			};
			Sound.prototype.unSend = function() {
				this.graph.unSend(arguments);
			};
			Sound.prototype.toString = function() {
				return 'audio.Sound object ' + this.name + '.';
			};
			Sound.prototype.isEqualTo = function(sound) {
				if (!sound || !sound instanceof Sound || !sound.name) return false;
				if (this === sound) return true;
				if (this.name == sound.name) return true;
				return false;
			};
			Sound.prototype.toJSON = function() {
				return {
					nodetype: 'Sound', 
					name: this.name,
					url: this.url,
					graph: this.graph.toJSON(),
					gain: this.gain.toJSON()
				}
			};

			Sound.prototype.publish = function(ev, options) {
		        var ev = ev || 'all';

		        if (this.subscribers[ev]) {
		            for (var i in this.subscribers[ev])
		                this.subscribers[ev][i](ev, options, doob);
		        }
		        // console.log(ev)
		        if (ev == 'all') return;
		        for (var i in this.subscribers['all'])
		                this.subscribers['all'][i](ev, options, doob);
		    };

		    Sound.prototype.subscribe = function(ev, subscriber) {
		        if (!ev || (subscriber && typeof subscriber != 'function')) return;
		        if (typeof ev == 'function') {
		            var subscriber = ev;
		            ev = 'all';
		        };
		        if (!this.subscribers[ev]) this.subscribers[ev] = [];
		        this.subscribers[ev].push(subscriber);
		    };

		    Sound.prototype.unsubscribe = function(ev, subscriber) {
		        var ev = ev || 'all';
		        if (typeof ev != 'string' || typeof subscriber != 'function' ||
		            !this.subscribers[ev]) return;
		        this.subscribers[ev].splice(this.subscribers[ev].indexOf(subscriber), 1);
		    };

			// sessionManager.makePublisher([Sound]);
			return {
				Sound: Sound,
				createSource: createSource,
				playSound: playSound,
				sourceQueue: sourceQueue,
				// soundBank: soundBank,
				events: events,
				duplicateSound: duplicateSound,
				subscribers: subscribers,
				subscribe: subscribe, 
				publish: publish,
				unsubscribe: unsubscribe
			}
		}(doob, io));

	};
});