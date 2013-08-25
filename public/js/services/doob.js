define(['services/services', 'lib/doob', 'lib/audio'], function(services, _doob, _audio){

	services.factory('doobio', function(socket){

		var loadedAssets = {};

		// doob unrelated messages...
		socket.on('user:notification', function(message){
			console.log('you have a new notification: %s', message);
		});

		socket.on('user:activity', function(message){
			console.log('New Activity: %s', message);
		});

		// doob related messages.
		socket.on('user:broadcast:entire:session', function(data){
			console.log('generating %s\'s production session on your session...', data.username);
			console.log(data);
		});
		

        _doob.prototype.loadBuffer = function(config, callback) {

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

	            	self.context.decodeAudioData(request.response, function(buffer){

	                loadedAssets[config.url] = buffer;

	                if (config.load && typeof config.load === 'function') config.load(buffer);

	                
	            });
	        };
	        request.send();
	    }

    	function doob(name) {
    		this.name = name,
    		this.env = new _doob();
    		instances[name] = this;
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
				instanceNames.push(name);
				return new doob(name);
			},
			playInline: function(instance, sound) {
				if (typeof instance == 'string') {

					_audio(instances[instance].env).playSound({
							buffer: instances[instance].env.assets[sound].buffer,
							graph: instances[instance].env.assets[sound].graph
					});
					
				}
			}
		};
	});
	
});