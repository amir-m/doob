define(['directives/directives'], function(directives){

	directives.directive('updateTime', 
	['$filter',
	function ($filter) {
	
		return {
			
			link: function(scope, element, attrs) {
				element.bind('mouseover', function(){
					scope.time = $filter('time')(scope.audioFile.timestamp, 'compare:now');
					if (scope.$$phase != '$apply' && scope.$$phase != '$digest')
						scope.$apply();
				});
			}
		}
	}]);
});