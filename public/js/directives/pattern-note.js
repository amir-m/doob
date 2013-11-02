define(['directives/directives'], function(directives){

	directives.directive('doob.pattern.note', function(){
	
		return {
	
			templateUrl: 'partials/template/doob/general/pattern-note.html',
			restrict: 'E',
			replace: true,
			link: function(scope, element, attrs) {

				
				
				scope.on = "btn btn-pattern btn-success";
				scope.off = "btn btn-pattern";
				var onClass = "btn btn-pattern btn-success", offClass = "btn btn-pattern";
				var onIcon = "music", offIcon = "";
				var on = false, p;
				
				scope.onOff = offClass;
				scope.icon = offIcon;

				
				p = scope.$parent.patternSound.pattern;
				p = scope.track.pattern;
				
				
				

				if (scope.patternSound.pattern.indexOf((scope.$index + 1)) != -1) {
					on = true;
					scope.onOff = onClass;
					scope.icon = onIcon;
				}
				scope.toggleNote = function(i) {

					console.log(scope.$index + 1);
					
					scope.pattern.toggleNote(scope.$parent.$index + 1, 
						scope.patternSound, true);
					on = !on;
					scope.onOff = on ? onClass : offClass;
					scope.icon = on ? onIcon : offIcon;
				};
			}
		}
	});
});