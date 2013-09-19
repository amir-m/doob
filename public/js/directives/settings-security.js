define(['directives/directives'], function(directives){

	directives.directive('settingsSecurity', [ '$http',

	function($http){
	
		return {
	
			templateUrl: 'partials/template/doob/settings-security.html',
			// require: '^soundPatterns',
			restrict: 'E',
			// replace: true,
			
			link: function(scope, element, attrs) {

				scope.changePassword = function() {
					if (!scope.pass || !scope.newPass)
						
						return scope.$emit("error:message", 
							"Please fill the current and new password fields. Thanks!");

					$http.put('/changepassword', {
						password: scope.pass,
						newPassword: scope.newPass
					}).success(function(){
						scope.$emit("success:message", "You just changed your password.", 3000);
					}).error(function(reason, status){
						console.log(status)
						if (status == 401) 
							return scope.$emit("error:message", 
								"We couldn`t authenticate you. Please try again!");

						scope.$emit("error:message", reason);

					});
				};

				scope.changeEmail = function() {
					if (!scope.chngemailpass || !scope.newemail)
						
						return scope.$emit("error:message", 
							"Please type your password and a new email address. Thanks!");

					$http.put('/changeemail', {
						password: scope.chngemailpass,
						email: scope.newemail
					}, {cache: false}).success(function(){
						scope.$emit("success:message", "You just changed your email.", 3000);
					}).error(function(reason, status){
						console.log(status)
						if (status == 401) 
							return scope.$emit("error:message", 
								"We couldn`t authenticate you. Please try again!");
						if (status == 409) 
							return scope.$emit("error:message", 
								"Please try another email address.");

						scope.$emit("error:message", reason);

					});

				// console.log(scope.chngemailpass)
				// console.log(scope.newemail)
				};
			}
		}
	}]);
});