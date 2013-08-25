define(['directives/directives'], function(directives){

	directives.directive('doob.play.inline', function(doobio, $rootScope){
	
		return {
	
			templateUrl: 'partials/template/doob/general/play-inline.html',
			restrict: 'E',
			replace: false,
			scope: {
				sound: '=',
				context: '='
			},
			link: function(scope, element, attrs) {

				scope.play = function() {
					doobio.playInline(scope.context, scope.sound);
				}
			}
		}
	});
});