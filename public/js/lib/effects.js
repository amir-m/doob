define([], function(){	
	
	return function (doob, io) {
		
		return (function invocation(){

			var subscribers = {
                    all: []
                };

            var publish = function(ev) {
                var ev = ev || 'all';
                var args = arguments;
                if (subscribers[ev]) {
                    for (var i in subscribers[ev])
                        subscribers[ev][i].apply(ev, args);
                }
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
			
			var loadReverbImpulse = function(config) {
				if (!config || !config.url)
					return {'effects.loadReverbImpulse':'Invalid arguments.'};

				config.name = config.name || doob.uniqueNames.ReverbImpulse;
				
				doob.loadBuffer({
					url: config.url, 
					load: function(buffer){
						
						publish('new:effects:impulse', {
							name: config.name,
							url: config.url,
							nodetype: 'reverbImpulse',
							buffer: buffer
						});

						// doob.reverbImpulses[config.name] = {
						// 	url: config.url,
						// 	buffer: buffer
						// };
						// doob.assetsToJSON[config.name] = {
						// 	nodetype: 'reverbImpulse',
						// 	name: config.name,
						// 	url: config.url
						// };
						// doob.[config.url] = buffer;
						
						if (config.callback && typeof config.callback === 'function') 
							config.callback(buffer);
					}
				});
			};

			function Reverb(config){
				
				//if (!config || config.impulse || config.impulse.url || config.impulse.name)
				var rev = doob.context.createConvolver(), id, impulse, asset;

				if (config && config.buffer) {
					rev.buffer = config.buffer;
					impulse = {
						name: config.impulse,
						url: doob.reverbImpulses[config.impulse].url
					}

					
				}

				// Reverb's impluse name is included with the config, and the impluse exists.
				else if (config && config.impulse && typeof config.impulse === 'string' 
					&& doob.reverbImpulses[config.impulse]) {
					rev.buffer = doob.reverbImpulses[config.impulse].buffer;
					impulse = config.impulse;
				} 

				//// Reverb's impluse object is included with the config, the impluse object
				//  	its URL and name exists.
				else if (config && config.impulse && config.impulse.url && config.impulse.name
					) {
					impulse = config.impulse;
					doob.loadBuffer({
						url: config.impulse.url,
						name: config.impulse.name,
						load: function(buffer){
							// doob.loadedAssets[config.impulse.url] = buffer;
							rev.buffer = buffer;
							if (config.callback && typeof config.callback === 'function')
								config.callback(buffer);
						}
					});
				}; 

				

				asset = rev;

				// Name is not defined, get a default name.
				if (!config || !config.name) 
					id = doob.uniqueNames.Reverb;

				else if (!doob.assets[config.name]) 
					id = config.name;

				else 
					throw 'doob.effectAssets.Reverb: Invalid id.';

				// The io.Graph is included with the config.
				// if (config && config.graph) {
				// 	config.graph.source = this.asset;
				// 	config.graph.connectable = this.connectable;
				// 	this.graph = config.graph;
			
				// } else {
				// 	this.graph = new io.Graph({
				// 		node: id,
				// 		source: this.asset,
				// 		connectable: this.asset,
				// 		destination: doob.masterGain
				// 	});
				// }

				

				// this.constructor = 'Reverb';


				// Object.defineProperty(this, 'name', {
				// 	enumerable: true,
				// 	configurable: false,
				// 	writable: false,
				// 	value: id
				// });
				var _impulse = impulse;

				var prop = {
					name: {
						enumerable: true,
						configurable: false,
						writable: false,
						value: id
					}, 
					asset: {
						enumerable: true,
						configurable: false,
						writable: false,
						value: asset
					},
					impulse: {
						enumerable: true,
						configurable: true,
						writable: true,
						value: _impulse
					}, 
					graph: {
						enumerable: true,
						configurable: true,
						writable: true,
						value: new io.Graph({
							node: id,
							source: asset,
							connectable: asset,
							destination: doob.masterGain,
							belongsTo: id,
							name: config.graphName || null
						})
					}
				};

				if (this instanceof Reverb) {
					Object.defineProperties(this, prop);
					// this.graph.connect();

					publish('new:effects:Reverb', this);
					
				}
				else {
					var o = Object.defineProperties(Reverb.prototype, prop);
					// o.graph.connect();
					// doob.assets[o.name] = o;
					// doob.assetsToJSON[o.name] = o.toJSON();
					publish('new:effects:Reverb', o);
					return o;
				}

				// doob.effect.publish('new-reverb', 
				// {
				// 	name: 'new-reverb',
				// 	dispatcher: self.toJSON()
				// });
			};

			Reverb.prototype.changeImpulse = function(impulse) {
				if (!impulse) return {'Reverb.prototype.changeImpulse':'Invalid arguments.'};
				if (typeof impulse === 'string' && reverbImpulses[impulse]) {
					this.reverb.buffer = reverbImpulses[impulse].buffer;
					return this;
				}
				if (impulse.name && reverbImpulses[impulse.name]) {
					this.reverb.buffer = reverbImpulses[impulse.name].buffer;
					return this;
				}
				if (impulse.name && impulse.url) {
					loadReverbImpulse({
						name: impulse.name, url: impulse.url,
						callback: function(buffer) {
							this.reverb.buffer = buffer;
						}
					});
				}
				return this;
			};
			
			Reverb.prototype.insert = function() {
				this.graph.insert(arguments);
			};

			Reverb.prototype.unInsert = function() {
				this.graph.remove(arguments);
			};

			Reverb.prototype.send = function() {
				this.graph.addSend(arguments);
			};

			Reverb.prototype.unSend = function() {
				this.graph.unSend(arguments);
			};

			Reverb.prototype.toJSON = function() {
				return {
					nodetype: 'Reverb',
					name: this.name,
					graph: this.graph.toJSON(),
					impulse: JSON.stringify(this.impulse)
				};
			};

			Reverb.prototype.toString = function() {
				return 'io.Reverb object ' + this.name + '.';
			};

			Reverb.prototype.isEqualTo = function(reverb) {
				if (!reverb || !reverb instanceof Reverb || !reverb.name) return false;
				if (this === reverb) return true;
				if (this.name == reverb.name) return true;
				return false;
			};

			// sessionManager.makePublisher([Reverb, Delay, Biquad]);
			return {
				Reverb: Reverb,
				loadReverbImpulse: loadReverbImpulse,
				subscribe: subscribe,
				unsubscribe: unsubscribe
			}
		}());
	};
});