define(['controllers/controllers', 'services/auth', 'services/socket', 'services/doob', 'uiBootstrap'], 
function(controllers){
	
	controllers.controller('home-ctrl', ['$scope', '$location', '$rootScope', 'auth', 'socket',
	'doobio', 'io', 'audio', 'sequencer', 'effects', '$http',
		function ($scope, $location, $rootScope, auth, socket, doobio, io, audio, sequencer, effects
			, $http) {

		$scope.$on('$routeChangeSuccess', function(next, current) { 
			// socket.connect();
		});

		if (!doobio.get($rootScope.username) && $rootScope.username) 
			doobio.create($rootScope.username);
		$rootScope.doob = doobio;

		// Check if the user's logged in
		auth.authenticate('/home');

		var kick, hat, clap, kickHat, kickHat2, rev;

		$scope.navBarClass = function() {

			if ($rootScope.username) return 'visible';

			return 'invisible';

			// return 'visible';
		}

		// scope variables.
		$scope.subscriberCount = 0;
		$scope.subscribers = [];

		// broadcasts, emits and watches
		// if ($rootScope.username) $scope.$emit('set:username', $rootScope.username);

		// handlers
		// $scope.$on('set:username', function(ev, username){
		// 	$rootScope.username = username;
		// });

		// $scope.$on('del:username', function(ev, username){
		// 	$rootScope.username = null;
		// });

		// functions
		$scope.logout = function(){
			auth.logout(this);
		}
		
		$scope.unsubsc = function(){
			// socket.emit('user:unsubscribe', {
			// 	username: $rootScope.username,
			// 	from: 'amir'
			// });
			$http.post('/me').success(function(data){
				console.log(data)
			}).error(function(status){
				console.log('shit $s', status)
			})
		}
		

		$scope.loadSound = function() {

			// console.log(doob.assets);
			// console.log(doob.assetsToJSON)
			// console.log(doob.dummyNodes);
	    	
		}

		$scope.add = function(){

			hat = new audio('amir').Sound({name:'Hat', url: '/public/wav/hat.wav'});
	    		kick = new audio('amir').Sound({name:'Kick', url: '/public/wav/kick.wav'}),
	    		clap = new audio('amir').Sound({name:'Clap', url: '/public/wav/clap.wav'});
			
	   //  	setTimeout(function(){
		  //   	kickHat = sequencer('amir').SoundPattern({
		  //   		sounds: ['Kick', 'Hat', 'Clap'],
		  //   		soundPatterns: {
		  //   			'Kick': [1,5,9,13],
		  //   			'Hat': [2,3,7,11,12,16],
		  //   			'Clap': [7, 15]
		  //   		}, tempo: 120, steps: 16, bars: 5//, route: {destination: doob.g}
		  //   	}, function(){
		  //   		$rootScope.$apply();
		  //   	});
		  //   	// console.log(sequencer('amir').SoundPattern);

				// // effects('amir').loadReverbImpulse({
				// // 	name: 'Five Columns Long',
				// // 	url: '/public/wav/impulses/Five_Columns_Long.wav',
				// // 	callback: function(buffer) {
				// // 		rev = new effects('amir').Reverb({
				// // 			buffer: buffer, 
				// // 			// destination: doobio.get('amir').env.masterGain,
				// // 			impulse: 'Five Columns Long'
				// // 		});
				// // 		kickHat.graph.addSend(rev);
			 // //    		console.log(kickHat.graph);
			 // //    		console.log(rev);
			 // //    		// console.log();
				// // 		// kickHat.io.graphs[2].addSend(rev);
				// // 	}
				// // });

	   //  	}, 2000);
	    	
	    	

		}

		// rev = new effects.Biquad({type: 2});

		$scope.me = function() {
			console.log(hat)
			// hat.play()
			// console.log(kickHat);
			// kickHat.io.graphs[2].addSend(rev);
			// socket.emit('test')
			kickHat.play();
		}

		$scope.remove = function(){
			kickHat2 = sequencer('amir').SoundPattern({
		    		sounds: ['Kick', 'Hat', 'Clap'],
		    		soundPatterns: {
		    			'Kick': [1,5,9,13],
		    			'Hat': [2,3,7,11,12,16],
		    			'Clap': [7, 15]
		    		}, tempo: 130, steps: 16, bars: 5//, route: {destination: doob.g}
		    	});
		}

		$scope.publishdoob = function(){
			doobio.broadcast('broadcast', $rootScope.username);

			// socket.emit('user:broadcast', obj);
		}
		
		$scope.subsc = function(){

			socket.emit('user:subscribe', {
				username: $rootScope.username,
				to: 'amir'
			});
		}

		// check is we are on the right scope, since many ng's create scopes and as a result,
		// events will be triggered multiple times...
		if ($scope.$parent == $rootScope) {
			
			// console.log('$scope.$parent == $rootScope')

		// real time events
			socket.on('new:subscriber', function(data){
				if ($scope.subscribers.indexOf(data.username) == -1) {
					$scope.subscriberCount++;
					$scope.subscribers.push(data.username);
				}
			});

			socket.on('new:unsubscribe', function(data){
				var index = $scope.subscribers.indexOf(data.username);
				if (index != -1) {
					$scope.subscriberCount--;
					$scope.subscribers.splice(index, 1);	
				}
			});

			socket.on('user:broadcast', function(data){
				console.log('WOW! new broadcaster: %s', data.username);
				console.log(data);
			});


		}
	}]);
});