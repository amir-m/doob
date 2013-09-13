define(['controllers/controllers'], 
function(controllers) {
	
	controllers.controller('HomeCtrl', ['$scope', '$location', '$rootScope', 'auth', 
		'socket', 'doobio', '$http', '$cookies', '$q', 'myinfoz',
		function ($scope, $location, $rootScope, auth, 
			socket, doobio, $http, $cookies, $q, myinfoz) {

		$scope.me = myinfoz;

		$scope.$emit('me:done', $scope.me);

		$("#topnav").slideDown(200);
		$("#btmerrmsg").hide();
		$("#btmloaderimg").hide();	

		$scope.navBar = 'visible';
		$scope.isBroadcasting = false;
		$scope.invitationEmail = '';
		$scope.searchUsers = [];
		$scope.searchSP = [];
		$scope.loadedSoundCategoryList = null;
		$scope.categoryListBindToSound = [];
		$scope.subscriberCount = 0;
		$scope.subscribers = [];
		
		var kick, hat, clap, kickHat, kickHat2, rev;

		$scope.followUser = function(user) {
			if (user.username in $scope.me._following) return;

			console.log(user)

			$http.put('/user/follow', {
				_id: user._id,
				username: user.username
			}).success(function(){
				$scope.me._following[user.username] = user;
				if ($scope.$$phase != "$apply" && $scope.$$phase != "$digest" ) $scope.$apply();
				$scope.me.following.push(user.username);
				socket.emit('user:follow', {
					event: 'user:follow',
					broadcaster: $rootScope.username,
					following: user.username,
					subscriber: user.username,
					timestamp: new Date().getTime()
				});
			}).error(function(data, status){
				console.log(data)
				console.log(status)
			});
		};

		$scope.subscribeTo = function(user) {
			$scope.me.subscribedTo.push(user.username);
			socket.emit('user:subscribe', {
				event: 'user:subscribe',
				broadcaster: $rootScope.username,
				to: user.username,
				timestamp: new Date().getTime()
			});
		}

		$scope.broadcast = function() {
			$scope.isBroadcasting = !$scope.isBroadcasting;
			doobio.toggleBroadcast($rootScope.username);
		};

		$scope.followButtonText = function(user) {
			return (user in $scope.me._following) ? 'Following' : 'Follow';
		}

		$scope.iFollow = function(user) {
			return (user in $scope.me._following);
		}

		$scope.subscribeButtonText = function(user) {
			return ($scope.me.subscribedTo.indexOf(user) != -1) ? 'Subscribed' : 'Subscribe';
		}

		$scope.iSubscribe = function(user) {
			return ($scope.me.subscribedTo.indexOf(user) != -1);
		}

		$scope.sendInvite = function(ev) {
			
			$scope.me.invitations = $scope.me.invitations - 1;

			$http.post('/invite', {
				email:  $scope._inviteEmail,
				name: $scope._inviteName,
				timestamp: new Date().getTime()
			}).success(function(){}).error(function(error){console.log(error)});
		}

		


		$scope.navBarClass = function(visibility) {

			if (visibility) return visibility;

			if ($rootScope.username) return 'visible';

			return 'invisible';

			// return 'visible';
		}


		$scope.logout = function(){
			auth.logout(this);
			$scope.isBroadcasting = false;
		}
		
		

		// (function(){
		$scope.loadSoundCategoryList = function() {

			var delay = $q.defer()

			if ($scope.loadedSoundCategoryList && $scope.categoryListBindToSound) {
				delay.resolve([$scope.loadedSoundCategoryList, $scope.categoryListBindToSound]);
			}
			else {

				$http.get('/sounds').success(function(data, status) {

					$scope.loadedSoundCategoryList = [];
					
					for (var i in data) {
						if (data[i].category != 'impulses') {
							$scope.loadedSoundCategoryList.push(data[i].category);
							$scope.categoryListBindToSound[i] = [];
							// scope.categoryListBindToSound[data[i].category] = data[i].sounds;
							// scope.categoryListBindToSound.push(data[i].sounds.name);
						// scope.loadedList[i] = true;
						for (var j = 0; j < data[i].sounds.length; ++j)
							$scope.categoryListBindToSound[i].push(data[i].sounds[j]);
						}
					}

					// console.log($scope.categoryListBindToSound)
					delay.resolve([$scope.loadedSoundCategoryList, $scope.categoryListBindToSound]);
				}).error(function(data, status) {
					console.log(data);
					delay.reject();
				});					
			}


			return delay.promise;
			// return $scope.loadedSoundCategoryList;
		}
		

	}]);
});