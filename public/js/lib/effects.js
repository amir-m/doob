define(['lib/io'], function(_io){	
	
	return function (doob) {
		var io = _io(doob);
		return (function (doob){
			var events = ['new-reverb'];

			var loadReverbImpulse = function(config) {
				if (!config || !config.url)
					return {'effects.loadReverbImpulse':'Invalid arguments.'};

				config.name = config.name || doob.uniqueNames.ReverbImpulse;
				
				doob.loadBuffer({
					url: config.url, 
					load: function(buffer){
						doob.reverbImpulses[config.name] = {
							url: config.url,
							buffer: buffer
						};
						doob.assetsToJSON[config.name] = {
							type: 'reverbImpulse',
							name: config.name,
							url: config.url
						};
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
					impulse = config.impulse;
				}

				// Reverb's impluse name is included with the config, and the impluse exists.
				if (config && config.impulse && typeof config.impulse === 'string' 
					&& doob.reverbImpulses[config.impulse]) {
					rev.buffer = doob.reverbImpulses[config.impulse].buffer;
					impulse = config.impulse;
				} 

				//// Reverb's impluse object is included with the config, the impluse object
				//  	its URL and name exists.
				else if (config && config.impulse && config.impulse.url && config.impulse.name
					&& !doob.reverbImpulses[config.impulse.name]) {
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

				impulse = impulse || config.impulse.name;

				asset = rev;

				// Name is not defined, get a default name.
				if (!config || !config.name) 
					id = doob.uniqueNames.Reverb;

				else if (!doob.effectAssets['Reverb'][config.name]) 
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
						configurable: false,
						writable: false,
						value: impulse
					}, 
					graph: {
						enumerable: true,
						configurable: false,
						writable: false,
						value: new io.Graph({
							node: id,
							source: asset,
							connectable: asset,
							destination: doob.masterGain
						})
					}
				};

				
				if (this instanceof Reverb) {
					Object.defineProperties(this, prop);
					this.graph.connect();
					doob.assets[id] = this;
					doob.assetsToJSON[this.name] = this.toJSON();
				}
				else {
					var o = Object.defineProperties(Reverb.prototype, prop);
					o.graph.connect();
					doob.assets[id] = o;
					doob.assetsToJSON[o.name] = o.toJSON();
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
					type: 'Reverb',
					name: this.name,
					graph: this.graph.toJSON(),
					impulse: this.impulse
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
				loadReverbImpulse: loadReverbImpulse
			}
		}(doob));
	}
});