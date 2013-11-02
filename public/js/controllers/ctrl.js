define(['controllers/controllers'], 
	function(controllers){

		controllers.controller('AppCtrl', ['$scope', '$location', '$rootScope', 'auth', 
			'$http','socket', '$timeout', '$q', 'me', 'doobio',
			function ($scope, $location, $rootScope, auth, $http, socket, $timeout, $q, me, doobio) {
				
				if ($rootScope.me) {
					$scope.me = $rootScope.me;
				}

				$rootScope.$on('$routeChangeError', function(event, current, previous, rejection){
					
					$("#btmnavbar").slideDown();
					$("#btmloaderimg").hide();
					$("#btmnavbarHide").hide();
					$("#btmerrmsg").show();
					$scope.notificationMessage = rejection;
				});

				$rootScope.$on('$routeChangeStart', function(event, current, previous, rejection){
					$("#btmnavbar").slideUp();
					$("#btmnavbarHide").hide();
					$("#btmerrmsg").hide();
					$("#btmloaderimg").show();
				});

				$rootScope.$on('$routeChangeSuccess', function(event, current, previous, rejection){
					
					if (previous && previous.$$route && previous.$$route.templateUrl == 'partials/login.html')
						return;
					
					$("#btmnavbar").slideUp();
					$("#btmnavbarHide").hide();
					$("#btmerrmsg").hide();
					$("#btmloaderimg").show();
				});

				$rootScope.$on('error:message', function(event, message){
					$scope.notificationMessage = message;
					$("#btmnavbarHide").show();
					$("#btmnavbar").slideDown();
					$("#btmscsmsg").hide();
					$("#btmerrmsg").show();
					$("#btminfosmsg").hide();
					$("#btmloaderimg").hide();
					if ($rootScope.$$phase != "$apply" && $rootScope.$$phase != "$digest") {
						$rootScope.$apply();
					}
				});
				$rootScope.$on('success:message', function(event, message, time, dontHide){
					$scope.notificationMessage = message;
					$("#btmnavbarHide").show();
					$("#btmnavbar").slideDown();
					var time = time || 5000;
					$("#btmscsmsg").show();
					$("#btmerrmsg").hide();
					$("#btminfosmsg").hide();
					$("#btmloaderimg").hide();
					
					if ($rootScope.$$phase != "$apply" && $rootScope.$$phase != "$digest") {
						$rootScope.$apply();
					}

					if (dontHide) return;

					$timeout(function(){
						$("#btmscsmsg").fadeOut();
						$("#btmnavbar").slideUp();
					}, time);
				});
				
				$rootScope.$on('info:message', function(event, message, time, dontHide){
					$scope.notificationMessage = message;
					$("#btmnavbarHide").show();
					$("#btmnavbar").slideDown();
					var time = time || 5000;
					$("#btminfosmsg").show();
					$("#btmscsmsg").hide();
					$("#btmerrmsg").hide();
					$("#btmloaderimg").hide();
					if ($rootScope.$$phase != "$apply" && $rootScope.$$phase != "$digest") {
						$rootScope.$apply();
					}

					if (dontHide) return;

					$timeout(function(){
						$("#btminfosmsg").fadeOut();
						$("#btmnavbar").slideUp();
					}, time);
				});

				$rootScope.$on('clear:message', function(){
					$scope.notificationMessage = '';
					$("#btmnavbarHide").show();
					$("#btmnavbar").slideUp();
					$("#btmscsmsg").fadeOut();
					$("#btmerrmsg").fadeOut();
					$("#btmloaderimg").fadeOut();
					if ($rootScope.$$phase != "$apply" && $rootScope.$$phase != "$digest") {
						$rootScope.$apply();
					}
				});

				$scope.$on('me:done', function(ev, me){
					$scope.me = me;
				});

				$scope.searchUsers = [];
				$scope.searchSP = [];
				$scope.isBroadcasting = false;
				$scope.loadedSoundCategoryList = null;
				$scope.categoryListBindToSound = [];
				$scope.notificationMessage = "";

				$scope.hideNav = function() {
					$("#btmnavbar").slideUp();
					$scope.notificationMessage = '';
				};


				$scope.gotoUser = function(name) {
					$location.path('/users/'+name);
				};

				$scope.followButtonText = function(user) {
					return (user in $scope.me._following) ? 'Following' : 'Follow';
				}

				$scope.broadcast = function() {
					$scope.isBroadcasting = !$scope.isBroadcasting;
					doobio.toggleBroadcast($rootScope.username);
				};

				$scope.gotoSP = function(name, id) {
					$location.path('/sound-patterns/'+name+'/'+id);
				};

				$scope.iFollow = function(user) {
					return (user in $scope.me._following);
				}

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

				$scope.logout = function(){
					auth.logout(this);
					$scope.isBroadcasting = false;
				}

				$scope.broadcast = function() {
					$scope.isBroadcasting = !$scope.isBroadcasting;
					doobio.toggleBroadcast($rootScope.username);
				};

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
									scope.categoryListBindToSound[data[i].category] = data[i].sounds;
									scope.categoryListBindToSound.push(data[i].sounds.name);
								scope.loadedList[i] = true;
								for (var j = 0; j < data[i].sounds.length; ++j)
									$scope.categoryListBindToSound[i].push(data[i].sounds[j]);
								}
							}

							delay.resolve([$scope.loadedSoundCategoryList, $scope.categoryListBindToSound]);
						}).error(function(data, status) {
							console.log(data);
							delay.reject();
						});					
					}


					return delay.promise;
				}


			}]);
});