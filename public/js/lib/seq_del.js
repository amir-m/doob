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

			var SoundPattern = function (config, callback) {


				config = config || {};
				config.name = config.name && !doob.assets[config.name] ? config.name : 
					doob.uniqueNames.SoundPattern;	

				var thisPatternGraph;			
				var properties = {
					name: {
						value: config.name,
						enumerable: true, writable: false, configurable: false
					}, 
					playStartTime: {
						value: config.playStartTime || doob.context.currentTime,
						enumerable: true, writable: true, configurable: false					
					}, 
					tempo: { 
						value: config.tempo || doob.tempo,
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
					soundPatterns: { 
						value: config.soundPatterns || [],
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
						value: config.bars || 1,
						enumerable: true, writable: true, configurable: false					
					}, 
					steps: { 
						value: config.steps || 16,
						enumerable: true, writable: true, configurable: false					
					}, 
					barTime: {
						value: config.barTime || (function(){
							fourth = config.fourthNoteTime || (60 / (config.tempo || tempo) / 4);
							steps = config.steps || 16;
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
					io: {
						value: null, 
						enumerable: false, writable: true, configurable: false	
					},
					sounds: {
						value: config.sounds, 
						enumerable: false, writable: true, configurable: false	
					},
					// sounds that exist in this pattern, correct sound copies.
					patternSounds: {
						value: [], 
						enumerable: false, writable: true, configurable: false	
					},
					// track names.
					tracks: {
						value: config.tracks || null, 
						enumerable: false, writable: true, configurable: false	
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

				// console.log(properties.gain.value.connectable)
				if (!properties.tracks.value){
					properties.tracks.value = {}
					for (var i in properties.sounds.value) {

						// craete new sounds for this pattern machine based on sounds provided by the 
						// user.
						var name = properties.sounds.value[i] + '_' + config.name;
						if (doob.assets[name]) name = doob.uniqueNames.Sound + '_' + config.name;
						var sound = audio.duplicateSound(properties.sounds.value[i], name);
						// connect the sound to this graph.
						sound.graph.destination = properties.gain.value.connectable;
						sound.graph.connect();
						properties.patternSounds.value.push(sound.name);

						// add new sound names to the soundPatterns and tracks objects, add them 
						// to tracks remove old names...
						if (properties.sounds.value[i] in properties.soundPatterns.value) {
							properties.soundPatterns.value[sound.name] = 
							properties.soundPatterns.value[properties.sounds.value[i]];

							delete properties.soundPatterns.value[properties.sounds.value[i]];
						}

						properties.tracks.value[properties.sounds.value[i]] = {
							name: properties.sounds.value[i],
							dummyName: sound.name,
							pattern: properties.soundPatterns.value[sound.name]
						};
					}
				}
				else {
					for (var i in config.tracks) {

						var sound = audio.duplicateSound(config.tracks[i].name, 
							config.tracks[i].dummyName);

						sound.graph.destination = properties.gain.value.connectable;
						sound.graph.connect();
						properties.patternSounds.value.push(sound.name);
					}
				}

				config.sounds = properties.patternSounds.value;

				// Invoked as a constructor.
				var o = Object.create(SoundPattern.prototype, properties); 

				Object.defineProperties(this, properties);
				config.graph ? _createRoutings(this, config.graph) : _createRoutings(this);
				o.io = (function(self){
					var soundObjects = {};
					var graphs = [];
					if (config.sounds && 
						Object.prototype.toString.call(config.sounds) === '[object Array]') {
						for (var i = 0, l = config.sounds.length; i < l; ++i) {
							if (!doob.assets[config.sounds[i]]) {
								soundObjects = {};
								throw 'The sound: ' + config.sounds[i] + 
								' does not exist. Did you forget to create it first?';
							}
							var graph = io.Graph({

								source: new io.Gain({name: self.name+'_'+config.sounds[i]+'_gain'}),
								send: self.graph,
								destination: doob.assets[config.sounds[i]].graph.source,
								node: config.name
							});
							graph.insert(self.graph);
							graph.addSend(self.graph);
							graph.connect();
							graphs.push(graph);
							soundObjects[config.sounds[i]] = {
								sound: doob.assets[config.sounds[i]], 
								graph: graph
							};
						}
					}
					return {
						get sounds() {return soundObjects},
						set sounds(s) {
							if (Object.prototype.toString.call(s) !== '[object Array]')
								throw 'Sounds can only be set to an array of sounds.';
							for (var i = 0, l = s.length; i < l; ++i) {
								if (!doob.assets[s[i]]) {
									soundObjects = {};
									throw 'The sound: ' + config.sounds[i] + 
									' does not exist. Did you forget to create it first?';
								}
								console.log('yes');

								var graph = io.Graph({
									source: new io.Gain({name: self.name+'_'+config.sounds[i]+'_gain'}),
									send: self.graph,
									destination: doob.assets[config.sounds[i]].graph.source,
									node: self.name,
									belongsTo: self.name
								});
								graph.insert(self.graph)
								graph.connect();
								graphs.push(graph);
								soundObjects[config.sounds[i]] = {sound: doob.assets[config.sounds[i]], 
									graph: graph
								};							
							}
						},
						graphs: graphs
					}
				}(o));
				
				publish('new:sequencer:SoundPattern', o);

				if (callback) callback(o);
				return o;

			};
			SoundPattern.prototype.play = function(mode) {
				if (this.playbackState == 1) return;
				if (mode) 
					this.enQ(true);
				else
					this.enQ();
			};
			SoundPattern.prototype.toggleNote = function(note, track) {
				console.log(note)
				// bad note object. good format of the note: {sound: soundName, note: noteNumber}
				if (!note || typeof track !== 'object') return;

				// invalid note number
				if (note > this.steps || note < 1) return;

				
				// if the note is on, make it off (remove it)!
				if (track.pattern.indexOf(note) != -1) {
					track.pattern.splice(track.pattern.indexOf(note), 1);
					this.soundPatterns[track.dummyName].splice(
						this.soundPatterns[track.dummyName].indexOf(note), 1);
				}
				// the note is off, turn it on (add it)!
				else {
					this.tracks[note.soundName].pattern.push(note.note);	
					this.soundPatterns[track.dummyName].push(note);
				}
			};

			SoundPattern.prototype.removeSound = function(track) {
				delete this.soundPatterns[track.dummyName];
				for (var i in this.tracks) {
					if (track.dummyName == this.tracks[i].dummyName)
						delete this.tracks[i];
				}
			};

			SoundPattern.prototype.addSound = function(s) {

				var name = s + '_' + this.name;
				// console.log(doob.assets)
					if (doob.assets[name]) 
						name = doob.uniqueNames.Sound + '_' + this.name;

				var sound = audio.duplicateSound(s, name);

 				sound.graph.destination = this.gain.connectable;
				sound.graph.connect();
				this.patternSounds.push(sound.name);

				
				if (s in this.soundPatterns) {
					this.soundPatterns[sound.name] = this.soundPatterns[s];

					delete this.soundPatterns[s];
				}
				else this.soundPatterns[sound.name] = [];

				if (this.tracks[s]) {
					this.tracks[doob.uniqueNames.Sound] = {
						name: s,
						dummyName: sound.name,
						pattern: []
					};
				}
				else
					this.tracks[s] = {
						name: s,
						dummyName: sound.name,
						pattern: this.soundPatterns[sound.name] || []
					};

				this.sounds.push(s);

				// console.log(this)

				publish('update:sequencer:SoundPattern:addSound', this, s);

			};
			SoundPattern.prototype.changeSoundPattern = function(change){
				if (!change || typeof change !== 'object') return;
				for (var sound in change) {
					if (!this.soundPatterns[sound] || change[sound] < 1 
						|| change[sound] >= this.steps) continue;
					// If the change is deletion (the sound index exists on the sound pattern array)
					if (change[sound] in this.soundPatterns[sound]) {
						// If it's a change on the fly (we are in play state), remove scheduled sources first.
						if (this.playbackState) {
							if (this.soundPatternSources[sound] && 
								this.soundPatternSources[sound][change[sound]])
								this.soundPatternSources[sound][change[sound]].stop ? 
								this.soundPatternSources[sound][change[sound]].stop(0) :
								this.soundPatternSources[sound][change[sound]].noteOff(0);
						}
						this.soundPatterns[sound].splice(this.soundPatterns[sound].indexOf(change[sound]), 1)
					}
					else {
						for (var i = 0; i < this.bars; ++i) {
							var beginIndex = this.lastScheduledSound - this.barTime; 
							var scheduled = (i * this.barTime) + (change[sound] * this.fourthNoteTime) +
							 beginIndex;
							 var source = doob.context.createBufferSource();
							 source.buffer = doob.assets[sound].buffer;
							 source.connect(gain);
							if (scheduled > this.lastScheduledSound) return;
							source.start ? source.start(scheduled) : source.noteOn(scheduled);
							this.patternSources.push(source);
							this.soundPatternSources[sound][change[sound]] = source;
							this.soundPatterns[sound].push(change[sound]);
							this.soundPatterns[sound].sort(function(a, b) {return a - b});	
						}

					}
				}
			};																									SoundPattern.prototype.enQ = function(loop) {
				
				if (!this.tracks) return;

				var self = this;

				this.playbackState = 1;

				schedule(loop ? 1 : this.bars);
				
				function schedule(bars) {
					for (var i = 0; i < 1; ++i) {

						for (var sound in self.tracks) {

							var indvSoundMappings = null;
							
							for (var j = 0; j < self.tracks[sound].pattern.length; ++j) {
								if (self.tracks[sound].pattern[j] < 1 
									|| self.tracks[sound].pattern[j] > self.steps) continue;

								var source = audio.createSource({
									destination: doob.assets[sound].graph.connectable, 
									buffer: doob.assets[sound].buffer
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
				};
				return this;
			};
			SoundPattern.prototype.setSounds = function(sounds) {
				if (!sounds) return;
				this.io.sounds = sounds;
			};
			SoundPattern.prototype.initializeSounds = function(sounds) {
				if (typeof sounds === 'undefined' || sounds == null)
					return;
				this.sounds = sounds;
				for (var i = 0; i < sounds.length; ++i) {
					this.soundSources[i] = new Array();
					this.soundPatterns[i] = new Array();
				}
			};
			SoundPattern.prototype.stop = function(options) {
				if (self.intvl) clearInterval(intvl);
				for (var i = 0, l = this.patternSources.length; i < l; ++i) {
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
			SoundPattern.prototype.schedule = function (startTime) {
				var initTime = startTime || this.playStartTime;
				for (var j = 0; j < this.soundPatterns.length; ++j) {
					for (var i = 0; i < this.steps; ++i) {
						if (this.soundPatterns[j][i]) {
							this.soundSources[j][i] = playSound(this.sounds[j], (initTime + i * this.fourthNoteTime) 
								- this.fourthNoteTime / 16);
							this.patternSources.push(this.soundSources[j][i]);
						}
					}
				}
			};

			SoundPattern.prototype.resetTiming = function(tempo) {
				this.tempo = tempo;
				this.sixteenthNoteTime = ((60) / this.tempo) / 1;
				this.eighthNoteTime = ((60) / this.tempo) / 2;
				this.fourthNoteTime = ((60) / this.tempo) / 4;
				this.secondNoteTime = ((60) / this.tempo) / 8;
				this.barTime = this.fourthNoteTime * this.steps			
				if (this.played) {
					this.stop({broadcast: false});
					this.play({broadcast: false});
				}
			};	
			SoundPattern.prototype.toString = function() {
				return 'doob.io.SoundPattern object ' + this.name + '.';
			};
			SoundPattern.prototype.isEqualTo = function(soundPattern) {
				if (!soundPattern || !soundPattern instanceof SoundPattern || !soundPattern.name) return false;
				if (this === soundPattern) return true;
				if (this.name == soundPattern.name) return true;
				return false;
			};
			SoundPattern.prototype.toJSON = function() {
				var obj = {
					nodetype: 'SoundPattern',
					name: this.name,
					tracks: this.tracks,
					graph: this.graph,
					gain: this.gain,
					tempo: this.tempo,
					bars: this.bars,
					steps: this.steps,
					sounds: this.sounds,
					soundPatterns: this.soundPatterns
				};

				return obj;
			};	
			return {
				SoundPattern: SoundPattern,
				subscribe: subscribe,
				unsubscribe: unsubscribe
			}
		}());	
	};
});