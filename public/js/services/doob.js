define(['services/services', 'lib/doob', 'lib/audio', 'lib/io', 'lib/effects', 'lib/sequencer'], 
	function(services, _doob, _audio, _io, _effects, _sequencer){

	services.factory('doobio', ['socket', '$http', '$rootScope', 
	function(socket, $http, $rootScope) {

		var loadedAssets = {}, self = this;

		// doob unrelated messages...
		socket.on('user:notification', function(message){
			console.log('you have a new notification: %s', message);
		});

		socket.on('user:activity', function(message){
			console.log('New Activity: %s', message);
		});

		socket.on('user:broadcast:stop', function(message){
			if (message.broadcaster == $rootScope.username) return;
			if (instances[message.broadcaster]) 
				instances[message.broadcaster].isBroadcasting = false;
		});

		socket.on('sync:request', function(message){
			console.log('sync request received from %s to %s', 
				message.subscriber, message.broadcaster);

			// this is a bad sync request.
			if (message.subscriber == $rootScope.username || 
				message.broadcaster != $rootScope.username)
				return;

			if (!instances[message.broadcaster].isBroadcasting) return;

			emit("sync:response", {
				event: 'sync:response',
				broadcaster: message.broadcaster,
				subscriber: message.subscriber,
				doob: instances[message.broadcaster].env.exportables
			});
		});	

		socket.on('sync:response', function(message){
			console.log('sync response received: from %s to %s', 
				message.subscriber, message.broadcaster);

			// this is a bad sync request.
			if (message.subscriber != $rootScope.username || 
				message.broadcaster == $rootScope.username)
				return;
			regenerate(message);

		});	
		
		// a new sound has been added, and is being broadcasted 'new:sequencer:SoundPattern'
		socket.on('set:sequencer:SoundPattern:id', function(message){

			console.log(message)

			if (message.broadcaster == $rootScope.username || 
				!instances[message.subscriber]) return;

			var sp = message.message;

			// the instance is already removed. just inform the server that the instance is gone.
			if (!instances[message.subscriber].env.assets[sp.pattern])
				return emit('remove:sequencer:SoundPattern', {
					event: 'remove:sequencer:SoundPattern',
					timestamp: new Date().getTime(),
					broadcaster: $rootScope.username,
					subscriber: message.subscriber,
					message: sp
				});

			var flag = message.broadcaster == 'sys' ? true : false;

			instances[message.subscriber].env.assets[sp.pattern].setId(sp.id, flag);

			// create all the sounds in this sound pattern
			for (var sound in sp.tracks)
				new instances[message.broadcaster].audio.sound({
					name: sound.name, url: sound.url
				});	
			

		});

		// a new sound has been added, and is being broadcasted 'new:sequencer:SoundPattern'
		socket.on('new:sequencer:SoundPattern', function(message){

			// TODO: LOGGING...
			// if the broadcaster is the same as this user, or if the broadcaster's instance 
			// has not yet been created, it's probably a wrong message.

			if (message.broadcaster == $rootScope.username || 
				!instances[message.broadcaster]) return;

			var sp = message.message;


			// create all the sounds in this sound pattern
			for (var sound in sp.tracks)
				new instances[message.broadcaster].audio.sound({
					name: sound.name, url: sound.url
				});	
			
			new instances[message.broadcaster].sequencer.SoundPattern(message.message);

		});

		socket.on('update:sequencer:SoundPattern:toggleNote', function(message){

			// TODO LOGGING...
			// if the broadcaster is the same as this user, or if the broadcaster's instance 
			// has not yet been created, it's probably a wrong message.
			if (message.broadcaster == $rootScope.username || 
				!instances[message.subscriber]) return;

			instances[message.subscriber].env.assets[message.message.pattern].toggleNote(
				message.message.note, message.message.track);

		});

		socket.on('update:sequencer:SoundPattern:newTrack', function(message){

			// TODO LOGGING...
			// if the broadcaster is the same as this user, or if the broadcaster's instance 
			// has not yet been created, it's probably a wrong message.
			if (message.broadcaster == $rootScope.username || 
				!instances[message.subscriber]) return;
			
			instances[message.subscriber].env.assets[message.message.pattern].newTrack(message.message.track);

		});

		socket.on('update:sequencer:SoundPattern:removeTrack', function(message){

			// TODO LOGGING...
			// console.log(message)

			// if the broadcaster is the same as this user, or if the broadcaster's instance 
			// has not yet been created, it's probably a wrong message.
			if (message.broadcaster == $rootScope.username || 
				!instances[message.subscriber]) return;
			
			instances[message.subscriber].env.assets[message.message.pattern].removeTrack(message.message.track);

		});

		// a new sound has been added, and is being broadcasted
		socket.on('new:aduio:Sound', function(message){

			// TODO: LOGGING...
			// if the broadcaster is the same as this user, or if the broadcaster's instance 
			// has not yet been created, it's probably a wrong message.
			if (message.broadcaster == $rootScope.username || 
				!instances[message.broadcaster]) return;

			var s = message.message;

			// TODO: check the message.
			if (message.broadcaster == $rootScope.username) return;

			var sound = {
				name: s.name,
				url: s.url,
				gainName: s.gain.name,
				graphName: s.graph.name
			};
			
			
			new instances[message.broadcaster].audio.Sound(sound);

		});

		socket.on('user:broadcast:start', function(message){

			console.log(message)

			if (message.broadcaster == $rootScope.username) return;
			
			if (instances[message.broadcaster]) {
				instances[message.broadcaster].isBroadcasting = true;
				// TODO: send a sync request
			}
			else
			{
				new doob(message.broadcaster);
			}

			regenerate(message);	
		});

		// doob related messages.
		
		
		var emit = function(event, message) {
			// if (message.broadcaster && message.subscriber 
			// 	&& message.broadcaster == message.subscriber) return;
			console.log(message)
			if (!message.timestamp) message.timestamp = new Date().getTime();
			socket.emit(event, message);
		};

		var regenerate = function(message) {

			if (!message.doob || !message.broadcaster) return;
			var d = message.doob;
			var re_d = instances[message.broadcaster] || new doob(message.broadcaster);
			instances[message.broadcaster].isBroadcasting = true;			

			// load reverbs
			for (var i in d.independents.effects.reverbs) {
				console.log(d.independents.effects.reverbs[i].impulse)
				var t = new re_d.effects.Reverb({
					name: d.independents.effects.reverbs[i].name,
					graphName: d.independents.effects.reverbs[i].graphName,
					impulse: d.independents.effects.reverbs[i].impulse
				});
				
			}

			// load sounds
			for (var i in d.independents.sounds)
				new re_d.audio.Sound({
					name: d.independents.sounds[i].name,
					url: d.independents.sounds[i].url,
					graphName: d.independents.sounds[i].graphName,
					gainName: d.independents.sounds[i].gainName
				});

			// load routes
			for (var i in d.dependents.graphs)
				if (d.dependents.graphs[i].sendingNodes.length > 0) {
					var holder = d.dependents.graphs[i].belongsTo;
					for (var j = 0; j < d.dependents.graphs[i].sendingNodes.length; ++j) {
						var sendingNode = d.dependents.graphs[i].sendingNodes[j];
						
						re_d.env.assets[holder].graph.addSend(re_d.env.assets[sendingNode]);
					}
				}


			// load soundPatterns
			for (var i in d.independents.sequencers.soundPatterns) {
				var sp = {
					name: d.independents.sequencers.soundPatterns[i].name,
					tempo: d.independents.sequencers.soundPatterns[i].tempo,
					bars: d.independents.sequencers.soundPatterns[i].bars,
					steps: d.independents.sequencers.soundPatterns[i].steps,
					tracks: d.independents.sequencers.soundPatterns[i].tracks
				};
				
				new re_d.sequencer.SoundPattern(sp);
			}

		}

		var loadBuffer = function(config, callback) {
        	var self = this;
	        if (!config.url) throw 'loadBuffer : Invalid arguments';
	        if (loadedAssets[config.url]) {
	            if (config.load && typeof config.load === 'function') 
	                config.load(loadedAssets[config.url]);

	            if (callback) return callback(loadedAssets[config.url]);
	            return;
	        }

	        var request = new XMLHttpRequest();

	        request.open('GET', config.url, true);
	        request.responseType = 'arraybuffer';

	        request.onload = function() {

	            if (config.loading && typeof config.loading === 'function') config.loading();

	            	instances[$rootScope.username].env.context.decodeAudioData(request.response, 
	            	function(buffer){

	                loadedAssets[config.url] = buffer;

	                if (config.load && typeof config.load === 'function') 
	                	return config.load(buffer);

	                if (callback) return callback(buffer);
	                
	            });
	        };
	        request.send();
	    }

		var handlers = {
			doob: {
				sync: function(ev, exportable) {
					$http({
						method: 'post',
						url: '/project',
						headers: {
							'Content-Type': 'application/json'
						},
						data: JSON.stringify(exportable)
					}).success(function(){
						console.log('/project SUCCEED!');
					}).error(function(){
						console.log('/project ERROR!');
					});
				}
			},
			audio: {
				'new:aduio:Sound': function(ev, exportable, name) {
						
						emit(ev, {
							event: ev,
							broadcaster: $rootScope.username,
							subscriber: name,
							message: exportable
						});
					// }
				}
			},
			io: {
				'new:io:Graph': function(ev, exportable, name) {
					// console.log('handler.io.new:io:Graph');
				}
				, 
				'new:io:Gain': function(ev) {
					// console.log('handler.io.new:io:Gain');
				},
				'update:io:Graph:addSend': function(ev, node, name) {
                    // console.log('handler.io.update:io:Graph:addSend');   
                }
			}, 
			effects: {
				'new:effects:impulse': function(ev, exportable, name) {
					// console.log('handler.effects.new:effects:impulse');
				},
				'new:effects:Reverb': function(ev, exportable, name) {
					// console.log('handler.effects.new:effects:Reverb');
				}
			},
			sequencer: {
                'new:sequencer:SoundPattern': function(ev, message, name) {
					
					// if (instances[name].isBroadcasting) {
						emit(ev, {
							event: ev,
							broadcaster: $rootScope.username,
							subscriber: name,
							message: message
						});
					// }

                }, 
                'update:sequencer:SoundPattern:toggleNote': function(ev, message, name) {

					// if (instances[name].isBroadcasting) {
						emit(ev, {
							event: ev,
							broadcaster: $rootScope.username,
							subscriber: name,
							message: message
						});
					// }

                },
                'update:sequencer:SoundPattern:newTrack': function(ev, message, name) {

					// if (instances[name].isBroadcasting) {
						emit(ev, {
							event: ev,
							broadcaster: $rootScope.username,
							subscriber: name,
							message: message
						});
					// }
                },
                'update:sequencer:SoundPattern:removeTrack': function(ev, message, name) {

					// if (instances[name].isBroadcasting) {
						emit(ev, {
							event: ev,
							broadcaster: $rootScope.username,
							subscriber: name,
							message: message
						});
					// }

                }, 
                'set:sequencer:SoundPattern:id': function(ev, message, name) {

					// if (instances[name].isBroadcasting) {
						emit(ev, {
							event: ev,
							broadcaster: $rootScope.username,
							subscriber: name,
							message: message
						});
					// }

                }, 
				"remove:sequencer:SoundPattern": function(ev, message, name) {
					emit(ev, {
						event: ev,
						broadcaster: $rootScope.username,
						subscriber: name,
						message: message
					});
				}
            }
		}
		

        

    	function doob(name) {

    		this.name = name;
    		this.isAlien = name == $rootScope.username ? false : true;
    		this.isBroadcasting = false;
    		this.isListening = false;
    		this.sounds = [];
    		this.env = new _doob(name);
    		this.env.loadBuffer = loadBuffer;
    		this.io = _io(this.env);
    		this.audio = _audio(this.env, this.io);
    		this.effects = _effects(this.env, this.io);
    		this.sequencer = _sequencer(this.env, this.io, this.audio);

    		// subscribe doobio to all events of this doob
    		for (var i in handlers) 
    			for (var j in this.env.handlers[i])
    				this.env.subscribe(j, handlers[i][j]);

    		// subscribe this doob to all events of this doob's audio, io, effects, etc events
    		for (var i in this.env.handlers) 
    			for (var j in this.env.handlers[i])
    				this[i].subscribe(j, this.env.handlers[i][j]);


    		// subscribe this doob to all events of this doob's io events
    		// for (var i in this.env.handlers.io) 
    		// 	this.io.subscribe(i, this.env.handlers.io[i]);


    		instances[name] = this;
    		instanceNames.push(this.name);
    	}

    	var instances = {}, instanceNames = [];

        // console.log();
		
		return {
			get: function(name){
				// console.log(instances[name].env)
				return instances[name] ? instances[name].env : null;
			}, 
			instances: instances,
			instanceNames: instanceNames,
			broadcast: function(e, name) {
				var obj = {
					'username': name,
					'doob': {
						assets: instances[name].env.assetsToJSON,
						sounds: instances[name].env.sounds,
						soundPatterns: instances[name].env.soundPatterns,
						dummyNodes: instances[name].env.dummyNodes
					}
				};
				// obj = JSON.stringify(obj);
				// console.log(instances[name].env.loadedAssets);
				socket.emit('user:broadcast:entire:session', obj);
			},
			create: function(name){
				if (!name) return null;
				if (instances[name]) return instances[name].env;
				return new doob(name);
			},
			playInline: function(instance, sound) {
				if (typeof instance == 'string') {

					_audio(instances[instance].env).playSound({
							buffer: instances[instance].env.assets[sound].buffer,
							graph: instances[instance].env.assets[sound].graph
					});
					
				}
				else if (sound.url) {
					loadBuffer(sound, function(buffer){
						instances[$rootScope.username].audio.playSound({
							buffer: buffer,
							destination: instances[$rootScope.username].env.masterGain
						});
					});
				}
			},
			get sounds() {

				var s = new Array();

				// console.log(instances)

				for (var i in instances) {
					s = s.concat(instances[i].env.sounds);
				}
				return s;
			}, 
			get soundPatterns() {

				var s = new Array();

				for (var i in instances) {
					s = s.concat(instances[i].env.soundPatternsArray);
				}
				return s;
			},
			audio: function(name) {
				
				if (!name) return;

				if (typeof name == 'string')
					return instances[name].audio;

				return;
			},
			effects: function(name) {
 
 				if (!name) return;

				if (typeof name == 'string')
					return instances[name].effects;

				return;
			},
			sequencer: function(name) {
 
 				if (!name) return;

				if (typeof name == 'string')
					return instances[name].sequencer;

				return;
			},
			toggleBroadcast: function(name) {

				if (!name) return;
				if(instances[name].isBroadcasting) {
					instances[name].isBroadcasting = false;
					emit("user:broadcast:stop", {
						event: 'user:broadcast:stop',
						broadcaster: $rootScope.username,
						subscriber: name
					});
				}
				else {
					instances[name].isBroadcasting = true;
					emit("user:broadcast:start", {
						event: 'user:broadcast:start',
						broadcaster: $rootScope.username,
						subscriber: name,
						doob: instances[name].env.exportables
					});	
				}
			}
		};
	}]);
	
});