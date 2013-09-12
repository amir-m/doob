define(['directives/directives'], function(directives){

	directives.directive('spComment', ['doobio', '$rootScope', 'socket',
		function(doobio, $rootScope, socket){
	
		return {
				
			link: function(scope, element, att) {
				element.bind('keyup', function(e){
					if (e.which == 13) {
						// console.log('comment');
						// console.log($(element).val());
						if ($(element).val().length > 0)
							socket.emit('new:soundPattern:comment', {
								event: 'new:soundPattern:comment',
								broadcaster: $rootScope.username,
								commenter: $rootScope.username,
								patternId: scope.patternInfo._id,
								timestamp: new Date().getTime(),
								comment: $(element).val()
							});
						if (scope.patternInfo && !scope.patternInfo.comments)
							scope.patternInfo.comments = [];

						scope.patternInfo.comments.push({
							commenter: $rootScope.username,
							patternId: scope.patternInfo._id,
							timestamp: new Date().getTime(),
							comment: $(element).val()
						});

						scope.$apply();
						
						$(element).val('');
						$(element).blur();
					}
				});
			}

		}
	}]);
});