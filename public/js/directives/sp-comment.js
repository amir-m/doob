define(['directives/directives'], function(directives){

	directives.directive('spComment', ['doobio', '$rootScope', 'socket',
		function(doobio, $rootScope, socket){
	
		return {
				
			link: function(scope, element, att) {
				
				// console.log(scope.patternInfo)
				// console.log(scope.instanceName)
				// console.log(scope.pattern)

				element.bind('keyup', function(e){
					if (e.which == 13) {
						// console.log('comment');
						// console.log($(element).val());
						if ($(element).val().length == 0) return;

						var time = new Date().getTime();
						var comment = $(element).val();

						var promise = doobio.requestID();

						promise.then(function (id) {
							socket.emit('new:soundPattern:comment', {
								event: 'new:soundPattern:comment',
								_id: id,
								broadcaster: $rootScope.username,
								timestamp: time,
								data: {
									commenter: $rootScope.username,
									resource: scope.patternInfo._id,
									comment: comment
								}
							});

							if (scope.patternInfo && !scope.patternInfo.comments)
								scope.patternInfo.comments = [];

							scope.patternInfo.comments.push({
								_id: id,
								commenter: $rootScope.username,
								timestamp: time,
								comment: comment
							});
							
							if (scope.$$phase != "$apply" && scope.$$phase != "$digest")
								scope.$apply();

							$(element).val('');

						}, function (error) {
							scope.$emit("error:message", "Something went wrong. Please try again. If it still doesn`t work, please reload the page.")
						});
					}
				});
			}

		}
	}]);
});