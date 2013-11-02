define(['directives/directives'], function(directives){

	directives.directive('audioFetcher', 
	[
	function () {
	
		return {
			link: function(scope, element, attrs) {
				element.bind('scroll', function () {
					// console.log('scrolled over me man !!');
				});
				
			}
		}
	}]);
});