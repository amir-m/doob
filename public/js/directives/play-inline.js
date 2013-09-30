define(['directives/directives'], function(directives){

	directives.directive('playInline', ['doobio', '$rootScope', 
		function(doobio, $rootScope) {
	
		return {
	
			templateUrl: 'partials/template/doob/play-inline.html',
			restrict: 'E',
			replace: false,
			scope: {
				sound: '=',
				context: '=',
				iconPosition: '='
			},
			link: function(scope, element, attrs) {
				
				scope.position = function() {
					return scope.iconPosition;
				}

				scope.play = function() {
					doobio.playInline(scope.context, scope.sound);
					element.bind('click', function (e) {
                    	e.stopPropagation();
                	});
				}
			}
		}
	}]);
});