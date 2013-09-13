define(['controllers/controllers'], 
	function(controllers){

		controllers.controller('user-ctrl', ['$scope', '$location', '$rootScope', 'myinfoz', 'user',
			function ($scope, $location, $rootScope, myinfoz, user) {
				$scope.user = user;
				$scope.me = myinfoz;

				$scope.$emit("me:done", $scope.me);

				$scope.show = function() {
					console.log($scope.user)
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

			}]);
});