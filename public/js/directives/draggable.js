define(['directives/directives'], function(directives){

	directives.directive('ngDraggable', ['doobio', function(doobio){
	
		return {

			link: function(scope, element, attrs) {

				$(element).draggable({
					// revert: 'invalid',
					// helper: 'clone',
					start: function(){
						$( element ).css('cursor', '-webkit-grabbing');
					}, 
					stop: function() {
						$( element ).animate({
							top: 0,
							left: 0
						})
						$( element ).css('cursor', '-webkit-grab');
					}
				});
			}
		}
	}]);
});