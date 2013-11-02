function LoginCtrl($scope, $location, Auth) {

	var promise = Auth.authenticate();

	promise.then(function(){
		return $location.path('/home');
	});

	$scope.err = null;
	$scope.lrm = true;
	$scope.rrm = true;

	$scope.login = function(){
		Auth.login($scope.lu, $scope.lp, function(status){
			if (status == 401) $scope.err = 'Invalid username or password';
		});
		return false;
        // socket.emit('login:request', $scope.lu);
	};
	$scope.register = function(){
		Auth.register($scope.ru, $scope.rp, function(status){
			if (status == 400) $scope.err = 'Bad registration request';
		});
		return false;
	};
};

function HomeCtrl ($scope, $location, $rootScope, Auth, socket, doob) {

	$scope.$on('$routeChangeSuccess', function(next, current) { 
		// socket.connect();
	});

	// Check if the user's logged in
	var promise = Auth.authenticate();

	promise.then(null, function(){
		return $location.path('/login');
	});



	// scope variables.
	$scope.username = Auth.username;
	$scope.subscriberCount = 0;
	$scope.subscribers = [];

	// functions
	$scope.logout = function(){
		$scope.username = null;
		Auth.logout();
	}

	$scope.me = function(){
		console.log(doob.assets);
	}

	$scope.subs = function(){
		socket.emit('user:subscribe', 'Amir');
	}
	
	$scope.pubs = function(){
		socket.emit('user:publish', {
			msg: 'YES! I did it!',
			user: $scope.username
		});
	}

	// check is we are on the right scope, since many ng's create scopes and as a result,
	// events will be triggered multiple times...
	if ($scope.$parent == $rootScope) {
		
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

		socket.on('user:publish', function(data){
			console.log('WOW! new publish message:');
			console.log(data);
		});
	}
};
