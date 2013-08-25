define(['directives/directives'], function(directives){

	directives.directive('doob.pattern.note', function(){
	
		return {
	
			templateUrl: 'partials/template/doob/general/pattern-note.html',
			// require: '^soundPatterns',
			restrict: 'E',
			replace: true,
			scope: {},
			link: function(scope, element, attrs) {

				var onClass = "btn btn-pattern btn-success", offClass = "btn btn-pattern";
				var onIcon = "music", offIcon = "";
				var on = false, p;
				
				scope.onOff = offClass;
				scope.icon = offIcon;

				// console.log(scope.$parent.pattern)
				p = scope.$parent.pattern.tracks[scope.$parent.patternSound].pattern;

				if (p.indexOf((scope.$parent.$index + 1) % scope.$parent.pattern.steps) != -1) {
					on = true;
					scope.onOff = onClass;
					scope.icon = onIcon;
				}
				scope.toggleNote = function(i, elem) {
					// console.log(element);
					// console.log(scope.$parent.pattern)
					// console.log(scope.$parent.$index + 1);
					scope.$parent.pattern.toggleNote({
						note: (scope.$parent.$index + 1) % scope.$parent.pattern.steps,
						soundName: scope.$parent.patternSound
					});
					on = !on;
					scope.onOff = on ? onClass : offClass;
					scope.icon = on ? onIcon : offIcon;
				};
			}
		}
	});
});