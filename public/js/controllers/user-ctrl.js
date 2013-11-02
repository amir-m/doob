define(['controllers/controllers'], 
	function(controllers){

		controllers.controller('UserCtrl', 
		['$scope', '$location', '$rootScope','user', '$http', 'socket', 'me', '$compile',
		function ($scope, $location, $rootScope, user, $http, socket, me, $compile) {

				$scope.user = user;

				$scope.append = function (audio) {
					
					for (var i = 0; i < audio.length; ++i) {
						var html = "<li><audio-track id='"+audio[i]._id+"'></audio-track><li>";
						var scope = $scope.$new();

						scope.audioFile = audio[i];

						/*
						*	append this pattern to the current sound patterns
						*/
						$('#audiostream').append($compile(html)(scope));

						if ($scope.$$phase != '$apply' && $scope.$$phase != '$digest')
							$scope.$apply();
					};
				};
				
				$scope.append($scope.user.audio);

				$(window).scroll( function() {
					if ($(window).scrollTop() == 
					$(document).height() - $(window).height()) {
						$scope.fetchNext();
					}
				});

				// TODO: add a socket listener for new audio-track events. 
				// When a new audio track arrives, insert it at the top of the list:
				// $('#audiostream') insert as first child...
				// notify the user...

				$scope.fetchNext = function () {

					/** aleary fetched everything... */
					if ($scope.user.audioFilesCount < $scope.user.audioSkip) return;

					$("#btmloaderimg").show();	
					$http.get('/user/'+$rootScope.username+'/audio?skip='+$scope.user.audioSkip)
					.success(function (data) {
						$("#btmloaderimg").hide();
						$scope.user.audioSkip = data.skip;
						$scope.append(data.audio);	
					}).error(function (er) {
						console.log(er)
					});
				};

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
				};

				$scope.broadcast = function() {
					$scope.isBroadcasting = !$scope.isBroadcasting;
					doobio.toggleBroadcast($rootScope.username);
				};

				$scope.followButtonText = function(user) {
					return (user in $scope.me._following) ? 'Following' : 'Follow';
				};

				$scope.iFollow = function(user) {
					return (user in $scope.me._following);
				};

				$scope.subscribeButtonText = function(user) {
					return ($scope.me.subscribedTo.indexOf(user) != -1) ? 'Subscribed' : 'Subscribe';
				};

				$scope.iSubscribe = function(user) {
					return ($scope.me.subscribedTo.indexOf(user) != -1);
				};

				$scope.sendInvite = function(ev) {

					$scope.me.invitations = $scope.me.invitations - 1;

					$http.post('/invite', {
						email:  $scope._inviteEmail,
						name: $scope._inviteName,
						timestamp: new Date().getTime()
					}).success(function(){}).error(function(error){console.log(error)});
				};

			}]);
});