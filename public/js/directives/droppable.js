define(['directives/directives'], function(directives){

	directives.directive('ngDroppable', ['doobio', function(doobio){
	
		return {

			link: function(scope, element, attrs) {

				$(element).droppable({
					
					accept: '[ng-draggable]',
					activeClass: 'activate-droppable',
					hoverClass: 'hover-droppable',
					drop: function (event, ui) {}

				});

				$(element).bind("drop", function(event, ui){
					
				})
			
			}
		}
	}]);
});