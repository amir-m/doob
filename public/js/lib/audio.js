define(['lib/io'], function (_io) {

	return function(doob){

		var io = _io(doob);
		return (function invocation(doob){
			var sourceQueue = {},
				soundBank = {},
				events = ['new-sound'];

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
					destination : sound.graph.source
				});
				source.start(doob.context.currentTime+time);
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
				// console.slog(sound)
				var config = {};
				for (var prop in doob.assets[sound])
					if (doob.assets[sound].hasOwnProperty(prop))
						config[prop] = doob.assets[sound][prop];

				config.name = duplicateName;
				
				delete config['gain'];
				delete config['graph'];

				doob.dummyNodes[duplicateName] = new Sound(config);

				return doob.dummyNodes[duplicateName];
			}

			var Sound = function (sound) {

				var self = this, buf, isL;
				if (!sound || !sound.url)  {
					throw 'audio.Sound : Invalid Sound arguments.';
				}
				sound.name = sound.name || doob.uniqueNames.Sound;

				if (doob.sounds.indexOf(sound.name) != -1) return doob.sounds[sound.name];

				var properties = {
					// Queues for onload, onloadind, onload, onfinishplaying & onstop events.
					// Functions will be triggered based on their registration order.
					name: {
						value: sound.name,
						enumerable: true, writable: true, configurable: false
					}, url: {
						value: sound.url,
						enumerable: true, writable: true, configurable: false
					}, isLoaded: {
						value: false, enumerable: true, writable: true, configurable: false
					}, buffer: {
						value: null, 
						enumerable: true, writable: true, configurable: false
					}, gain:{
						value: sound.gain || new io.Gain({name: sound.name + '_gain'}),
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
					properties.graph.value = new io.Graph({
						source: properties.gain.value,
						connectable: properties.gain.value.connectable,
						destination: sound.destination || doob.masterGain,
						node: properties.name.value
					});
							
				// Invoked as a constructor.
				if (this instanceof Sound) {
					Object.defineProperties(this, properties);
					this.constructor = 'Sound';
					soundBank[this.name] = this;
					sourceQueue[this.name] = [];
					doob.assets[sound.name] = this;	
					doob.assetsToJSON[this.name] = this.toJSON();
					doob.sounds.push(this.name);

					this.load();
				}
				// Invoked as a factory function.
				else {
					var o = Object.create(Sound.prototype, properties); 
					soundBank[this.name] = o;
					o.constructor = 'Sound';
					sourceQueue[this.name] = [];
					doob.assets[sound.name] = o;
					doob.assetsToJSON[o.name] = o.toJSON();
					doob.sounds.push(o.name);
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
					type: 'Sound', 
					name: this.name,
					url: this.url,
					graph: this.graph.toJSON(),
					gain: this.gain.toJSON()
				}
			};
			// sessionManager.makePublisher([Sound]);
			return {
				Sound: Sound,
				createSource: createSource,
				playSound: playSound,
				sourceQueue: sourceQueue,
				soundBank: soundBank,
				events: events,
				duplicateSound: duplicateSound
			}
		}(doob));

	};
});