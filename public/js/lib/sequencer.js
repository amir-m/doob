define([], function(){

	return function(doob, io, audio) {
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

			var SoundPattern = function (config, pub) {

				config = config || {};
				config.name = config.name && !doob.assets[config.name] ? config.name : 
					doob.uniqueNames.SoundPattern;	

				config.tempo = config.tempo || doob.tempo;

				var thisPatternGraph;			
				var properties = {
					name: {
						value: config.name,
						enumerable: true, writable: false, configurable: false
					},
					id: {
						value: config.id || null,
						enumerable: true, writable: true, configurable: false
					}, 
					playStartTime: {
						value: config.playStartTime || doob.context.currentTime,
						enumerable: true, writable: true, configurable: false					
					}, 
					tempo: { 
						value: config.tempo || tempo,
						enumerable: true, writable: true, configurable: false					
					}, 
					sixteenthNoteTime: { 
						value: config.sixteenthNoteTime || (function(){
							var tempo = config.tempo || tempo;
							return (60 / tempo / 1);
						}()),
						enumerable: true, writable: true, configurable: false					
					}, 
					eightthNoteTime: { 
						value: config.eightthNoteTime || (function(){
							var tempo = config.tempo || tempo;
							return (60 / tempo / 2);
						}()),
						enumerable: true, writable: true, configurable: false					
					}, 
					fourthNoteTime: { 
						value: config.fourthNoteTime || (function(){
							var tempo = config.tempo || tempo;
							return (60 / tempo / 4);
						}()),
						enumerable: true, writable: true, configurable: false					
					}, 
					secondNoteTime: { 
						value: config.secondNoteTime || (function(){
							var tempo = config.tempo || tempo;
							return (60 / tempo / 8);
						}()),
						enumerable: true, writable: true, configurable: false					
					},  
					soundPatternSources: { 
						value: config.soundPatternSources || {},
						enumerable: true, writable: true, configurable: false					
					}, 
					soundSources: { 
						value: config.soundSources || [],
						enumerable: true, writable: true, configurable: false					
					}, 
					patternSources: { 
						value: config.patternSources || [],
						enumerable: true, writable: true, configurable: false					
					}, 
					playbackState: { 
						value: config.playbackState || 0,
						enumerable: true, writable: true, configurable: false					
					}, 
					bars: { 
						value: config.bars || 2,
						enumerable: true, writable: true, configurable: false					
					}, 
					steps: { 
						value: config.steps || 32,
						enumerable: true, writable: true, configurable: false					
					}, 
					barTime: {
						value: config.barTime || (function(){
							fourth = config.fourthNoteTime || (60 / (config.tempo || doob.tempo) / 4);
							steps = config.steps || 32;
							return fourth * steps;
						}()),
						enumerable: true, writable: true, configurable: false					
					}, 
					scheduledBars: { 
						value: config.scheduledBars || 1,
						enumerable: true, writable: true, configurable: false					
					}, 
					gain: {
						value: config.gain || new io.Gain({
							name: config.gainName || config.name+'_gain',
							belongsTo: config.name
						}),
						enumerable: true, writable: true, configurable: false
					}, 
					graph: {
						value: null,
						enumerable: true, writable: true, configurable: false
					}, 
					cleanPlayedSources: { 
						value: function(){
							this.patternSources = this.patternSources.filter(function(source) {
								return source.playbackState != 3;
							});
						}, enumerable: false, writable: false, configurable: false					
					}, 
					lastScheduledSound: {
						value: config.lastScheduledSound,
						enumerable: true, writable: true, configurable: false
					}, 
					// track names.
					tracks: {
						value: config.tracks || {}, 
						enumerable: true, writable: true, configurable: true	
					}, 
					intvl: {
						value: null, 
						enumerable: false, writable: true, configurable: false	
					}

				};	
				properties.graph.value = new io.Graph({
					name: config.graphName || null,
					source: properties.gain.value, 
					connectable: properties.gain.value.connectable, 
					destination: doob.masterGain,
					node: config.name, 
					belongsTo: config.name
				});


				for (var i in config.tracks) {

					var sound = audio.duplicateSound(config.tracks[i].name, 
						config.tracks[i].dummyName);

					sound.graph.destination = properties.gain.value.connectable;
					sound.graph.connect();
				}


			var o = Object.create(SoundPattern.prototype, properties); 
			
			publish('new:sequencer:SoundPattern', o, pub);

			return o;

			};
			SoundPattern.prototype.play = function(mode) {
				console.log(this.id);
				if (this.playbackState == 1) return;
				if (mode) 
					this.enQ(true);
				else
					this.enQ();
			};

			SoundPattern.prototype.setId = function(id, pub) {


				if (!id || typeof id != 'string') return;

				this.id = id;

				publish('set:sequencer:SoundPattern:id', this, pub);
			};

			SoundPattern.prototype.toggleNote = function(note, track, pub) {
				
				if (!note) return;

				track = this.tracks[track];

				// invalid note number
				if (note > this.steps || note < 1) return;

				
				// if the note is on, make it off (remove it)!
				if (track.pattern.indexOf(note) != -1) {
					track.pattern.splice(track.pattern.indexOf(note), 1);
					
				}
				// the note is off, turn it on (add it)!
				else {
					// this.tracks[note.soundName].pattern.push(note.note);	
					track.pattern.push(note);
				}
				publish('update:sequencer:SoundPattern:toggleNote', this, track.id, note, pub);
				
			};

			SoundPattern.prototype.removeTrack = function(track) {
				console.log(track)
				console.log(this.tracks[track])

				delete this.tracks[track];
				console.log(this.tracks[track])

				publish('update:sequencer:SoundPattern:removeTrack', this, track);
			};

			SoundPattern.prototype.newTrack = function(s, id) {

				var sound = audio.duplicateSound(s, id);

 				sound.graph.destination = this.gain.connectable;
				sound.graph.connect();

				this.tracks[id] = {
					name: s,
					pattern: [],
					url: sound.url,
					id: id
				};
				

				publish('update:sequencer:SoundPattern:newTrack', this, s, id);

			};

			SoundPattern.prototype.renameTrack = function(s, id, pub) {

				var name = s + '_' + this.name;
					if (doob.assets[name]) 
						name = doob.uniqueNames.Sound + '_' + this.name;

				var sound = audio.duplicateSound(s, name);

 				sound.graph.destination = this.gain.connectable;
				sound.graph.connect();

				
				if (this.tracks[s]) {
					this.tracks[doob.uniqueNames.Sound] = {
						name: s,
						dummyName: sound.name,
						pattern: [],
						url: sound.url,
						id: id
					};
				}
				else
					this.tracks[s] = {
						name: s,
						dummyName: sound.name,
						pattern: [],
						url: sound.url,
						id: id
					};

				publish('update:sequencer:SoundPattern:newTrack', this, s, id, pub);

			};

			SoundPattern.prototype.enQ = function(loop) {
				
				if (!this.tracks) return;

				var self = this;

				this.playbackState = 1;

				schedule(loop ? 1 : this.bars);
				
				function schedule(bars) {
					if (self.playbackState == 0) return;
					for (var i = 0; i < 1; ++i) {

						for (var sound in self.tracks) {

							var indvSoundMappings = null;
							var name = self.tracks[sound].name;
							for (var j = 0; j < self.tracks[sound].pattern.length; ++j) {
								if (self.tracks[sound].pattern[j] < 1 
									|| self.tracks[sound].pattern[j] > self.steps) continue;

								var source = audio.createSource({
									destination: doob.assets[name].graph.connectable, 
									buffer: doob.assets[name].buffer
								});
								
								var t = (i * self.barTime) + 
								(self.tracks[sound].pattern[j] * self.fourthNoteTime + (doob.context.currentTime));
								source.start ? source.start(t) : source.noteOn(t);
								self.lastScheduledSound = doob.context.currentTime + self.barTime;
								self.patternSources.push(source);
								indvSoundMappings = {};
								indvSoundMappings[self.tracks[sound].pattern[j]] = source;
							}
							if (indvSoundMappings) self.soundPatternSources[sound] = indvSoundMappings;
						}
					}
					if (loop && self.playbackState != 0) {
						self.scheduledBars++; 

						intvl = setTimeout(function() {
							schedule(1);
							self.cleanPlayedSources();
						}, self.barTime * 1000);
					} 
					else if (!loop) 
						// stop it!
						setTimeout(function() {
							self.stop();
							self.cleanPlayedSources();
						}, (self.barTime) * 2000);
				};
				return this;
			};
			
			
			SoundPattern.prototype.stop = function(options) {
				
				if (this.intvl) clearInterval(intvl);
				for (var i = 0;i < this.patternSources.length; ++i) {
					if(this.patternSources[i]) {
						this.patternSources[i].stop ? this.patternSources[i].stop(0) : 
						this.patternSources[i].noteOff(0);
					}				
				}
				this.patternSources = [];
				this.playbackState = 0;
				this.scheduledBars = 1;
				this.soundPatternSources = {};
			};
			
			SoundPattern.prototype.toJSON = function() {
				return {
					nodetype: 'SoundPattern',
					name: this.name,
					tracks: this.tracks,
					soundPatterns: this.soundPatterns,
					graph: this.graph,
					gain: this.gain,
					tempo: this.tempo,
					bars: this.bars,
					steps: this.steps,
					sounds: this.sounds,
				};
			};

			SoundPattern.prototype.exportable = function() {

				for (var sound in this.tracks) {
					if (this.tracks[sound]['$$hashKey']) {
						delete this.tracks[sound]['$$hashKey'];
					}
					
				}

		   		return {
			   		nodetype: 'sequencer.SoundPattern',
                    name: this.name,
                    tracks: this.tracks,
                    tempo: this.tempo,
                    steps: this.steps,
                    bars: this.bars,
                    id: this.id
                };
			};	

			SoundPattern.prototype.changeTempo = function(tempo, pub) {
				
				this.tempo = tempo;
				this.sixteenthNoteTime = (60 / this.tempo / 1);
				this.eightthNoteTime = (60 / this.tempo / 2);
				this.fourthNoteTime = (60 / this.tempo / 4);
				this.secondNoteTime = (60 / this.tempo / 8);
				this.barTime = this.fourthNoteTime * this.steps;

				publish('update:sequencer:SoundPattern:changeTempo', this, tempo, pub);

				 
			};

			SoundPattern.prototype.changeSteps = function(steps, pub) {

				this.steps = steps;
				this.barTime = this.fourthNoteTime * this.steps;

				publish('update:sequencer:SoundPattern:changeSteps', this, steps, pub);

			};

			return {
				SoundPattern: SoundPattern,
				subscribe: subscribe,
				unsubscribe: unsubscribe
			}
		}());	
	};
});