define(['controllers/controllers'], 
	function(controllers){

		controllers.controller('ctrl', ['$scope', '$location', '$rootScope', 'auth', '$http','socket',
			function ($scope, $location, $rootScope, auth, $http, socket) {
				$scope.searchUsers = [];
				$scope.searchSP = [];
				$scope.isBroadcasting = false;

				$scope.$on('me:done', function(ev, me){
					$scope.me = me;
				});

				$scope.gotoUser = function(name) {
					$location.path('/users/'+name);
				};

				$scope.followButtonText = function(user) {
					return (user in $scope.me._following) ? 'Following' : 'Follow';
				}

				$scope.broadcast = function() {
					$scope.isBroadcasting = !$scope.isBroadcasting;
					// doobio.toggleBroadcast($rootScope.username);
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


			}]);
});