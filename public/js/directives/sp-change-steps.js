define(['directives/directives'], function(directives){

    directives.directive('spChangeSteps', ['doobio', function (doobio) {

        return {
            restrict: 'A',
        
            link: function (scope, element, attr) {
                
                element.bind('keydown', function (e) {
                    
                    if (e.which == 13)  {
                        scope.steps = parseInt(scope.steps);

                        if (isNaN(scope.steps) || scope.steps < 0 || scope.steps > 64) {
                            scope.$emit("error:message", 'Please enter an integer between 1 and 64 for steps :)');
                            return;
                        }
                        
                        else {
                            
                            doobio.instances[scope.instanceName].env.ids[scope.pattern.id].changeSteps(scope.steps, true);
                            scope.$emit("success:message", 
                                'You successfully changed '+ scope.name+'`s steps to ' + scope.steps +'.', 3000);

                            if (scope.$$phase != '$apply' && scope.$$phase != '$digest')
                                scope.$apply();

                            $(element).blur();                            
                        }
                    }
                });
            }
        };
    }]);
});