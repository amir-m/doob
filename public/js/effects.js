define(['lib/doob.js', 'lib/io.js'], function(doob, io){
		
	var effects = (function invocation(){
		var events = ['new-delay', 'new-reverb', 'new-biquad'],
			reverbImpulses = {},
			biquadTypes = {
			ALLPASS: 7,
			BANDPASS: 2,
			HIGHPASS: 1,
			HIGHSHELF: 4,
			LOWPASS: 0,
			LOWSHELF: 3,
			NOTCH: 6,
			PEAKING: 5,
		};
		var loadReverbImpulse = function(config) {
			if (!config || !config.name || !config.url)
				return {'effects.loadReverbImpulse':'Invalid arguments.'};
			doob.loadBuffer({
				url: config.url, 
				load: function(buffer){
					reverbImpulses[config.name] = {
						url: config.url,
						buffer: buffer
					};
					if (config.callback && typeof config.callback === 'function') 
						config.callback(buffer);
				}
			});
		};
		var Reverb = function(config){
			//if (!config || config.impulse || config.impulse.url || config.impulse.name)
			var rev = doob.context.createConvolver(), id;

			// Reverb's impluse Buffer is included with the config
			if (config && config.buffer) 
				rev.buffer = config.buffer;

			// Reverb's impluse name is included with the config, and the impluse exists.
			else if (config && config.impulse && typeof config.impulse === 'string' 
				&& reverbImpulses[config.impulse]) {
				rev.buffer = reverbImpulses[config.impulse].buffer;
			} 

			//// Reverb's impluse object is included with the config, the impluse object
			//  	its URL and name exists.
			else if (config && config.impulse && config.impulse.url && config.impulse.name
				&& !reverbImpulses[config.impulse.name]) {
				doob.loadBuffer({
					url: config.impulse.url, 
					load: function(buffer){
						reverb.buffer = buffer;
						if (config.callback && typeof config.callback === 'function')
							config.callback(buffer);
					}
				});
			}; 

			this.asset = rev;

			// The io.Graph is included with the config.
			if (config && config.graph) {
				config.graph.source = this.asset;
				this.graph = config.graph;
		
			} else {
				this.graph = new io.Graph({
					source: this.asset,
					destination: doob.masterGain
				});
			}

			this.graph.connect();

			this.constructor = 'Reverb';

			// Name is not defined, get a default name.
			if (!config || !config.name) 
				id = doob.uniqueNames.Reverb;

			else if (!doob.effectAssets['Reverb'][config.name]) 
				id = config.name;

			else 
				throw 'doob.effectAssets.Reverb: Invalid id.';

			Object.defineProperty(this, 'name', {
				enumerable: true,
				configurable: false,
				writable: false,
				value: id
			});

			doob.effect.publish('new-reverb', 
			{
				name: 'new-reverb',
				dispatcher: self.toJSON()
			});

			doob.effectAssets['Reverb'].push(id);
			doob.assets[id] = this;
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
		var Delay = function(config) {
			var d = doob.context.createDelay(), id;

			if(config && config.delayTime) 
				d.delayTime.value = config.delayTime;

			if (config && config.destination) 
				d.connect(config.destination);

			this.asset = d;

			// The io.Graph is included with the config.
			if (config && config.graph) {
				config.graph.source = this.asset;
				this.graph = config.graph;
		
			} else {
				this.graph = new io.Graph({
					source: this.asset,
					destination: doob.masterGain
				});
			}
			this.constructor = 'Delay';
			this.graph.connect();

			if (!config || !config.name) 
				id = uniqueNames.Delay;

			else if (!doob.effectAssets['Delay'][config.name]) 
				id = config.name;

			else 
				throw 'doob.effectAssets.Delay: Invalid id.';

			Object.defineProperty(this, 'name', {
				enumerable: true,
				configurable: false,
				writable: false,
				value: id
			});

			doob.effect.publish('new-delay', 
			{
				name: 'new-delay',
				dispatcher: self.toJSON()
			});

			doob.effectAssets['Delay'].push(id);
			doob.assets[id] = this;
		};
		Delay.prototype.delay = function(value) {
			if (!value) return {'Delay.prototype.delay':'Invalid arguments.'};
			value = typeof value === 'number' ? value : parseInt(value);
			if (isNaN(value)) return {'Delay.prototype.delay':'Invalid arguments.'};
			this.asset.delayTime.value = value;
			return this;
		};
		Delay.prototype.insert = function() {
			this.graph.insert(arguments);
		};
		Delay.prototype.unInsert = function() {
			this.graph.remove(arguments);
		};
		Delay.prototype.send = function() {
			this.graph.addSend(arguments);
		};
		Delay.prototype.unSend = function() {
			this.graph.unSend(arguments);
		};
		Delay.prototype.toJSON = function() {
		};
		Delay.prototype.toString = function() {
			return 'io.Delay object ' + this.name + '.';
		};
		Delay.prototype.isEqualTo = function(delay) {
			if (!delay || !delay instanceof Delay || !delay.name) return false;
			if (this === delay) return true;
			if (this.name == delay.name) return true;
			return false;
		};
		var Biquad = function(config) {
			var b = doob.context.createBiquadFilter(), id;

			if (config && config.frequency) 
				b.frequency.value = config.frequency;

			if (config && config.type && config.type != 0) {
				if (typeof config.type === 'string') {
					
					var t = parseInt(config.type);
					if (!isNaN(t) && t > 0 && t < 8) 
						b.type = t;
					else if (biquadTypes[t.toUpperCase()]) 
						b.type = biquadTypes[t.toUpperCase()];
				}
			}

			this.asset = b;

			// The io.Graph is included with the config.
			if (config && config.graph) {
				config.graph.source = this.asset;
				this.graph = config.graph;
		
			} else {
				this.graph = new io.Graph({
					source: this.asset,
					destination: doob.masterGain
				});
			}

			this.constructor = 'Biquad';
			this.graph.connect();

			if (!config || !config.name) 
				id = uniqueNames.Biquad;

			else if (!doob.effectAssets['Biquad'][config.name]) 
				id = config.name;

			else throw 'doob.effectAssets.Biquad: Invalid id.';

			Object.defineProperty(this, 'name', {
				enumerable: true,
				configurable: false,
				writable: false,
				value: id
			});

			doob.effect.publish('new-biquad', 
			{
				name: 'new-biquad',
				dispatcher: self.toJSON()
			});

			doob.effectAssets['Biquad'].push(id);
			doob.assets[id] = this;
		};
		Biquad.prototype.type = function(t) {
			if (!value) return {'Biquad.prototype.type':'Invalid arguments.'};
			if (typeof value === 'string') {
				var t = parseInt(value);
				if (!isNaN(t) && t >= 0 && t < 8) this.asset.type = t;
				else if (biquadTypes[t.toUpperCase()]) 
					this.asset.type = biquadTypes[t.toUpperCase()];
			} else if (typeof value === 'number' && value >=0 && value < 8) 
			this.asset.type = value; 
		};
		Biquad.prototype.insert = function() {
			this.graph.insert(arguments);
		};
		Biquad.prototype.unInsert = function() {
			this.graph.remove(arguments);
		};
		Biquad.prototype.send = function() {
			this.graph.addSend(arguments);
		};
		Biquad.prototype.unSend = function() {
			this.graph.unSend(arguments);
		};
		Biquad.prototype.toJSON = function() {
		};
		Biquad.prototype.toString = function() {
			return 'io.Biquad object ' + this.name + '.';
		};
		Biquad.prototype.isEqualTo = function(biquad) {
			if (!biquad || !biquad instanceof Biquad || !biquad.name) return false;
			if (this === biquad) return true;
			if (this.name == biquad.name) return true;
			return false;
		};
		// sessionManager.makePublisher([Reverb, Delay, Biquad]);
		return {
			Reverb: Reverb,
			Delay: Delay,
			Biquad: Biquad,
			loadReverbImpulse: loadReverbImpulse,
			reverbImpulses: reverbImpulses,
			biquadTypes: biquadTypes
		};
	}());

	// makePublisher(doob.effect);

	var evs = doob.effect.events;

	for (var i in evs){
		// subsribe doob to all effect events.
		doob.effect.subscribe(doob.eventHandlers[evs[i]]);
	}

	return effects
});