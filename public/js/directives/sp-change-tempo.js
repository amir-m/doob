define(['directives/directives'], function(directives){

    directives.directive('spChangeTempo', ['doobio', function (doobio) {

        return {
            restrict: 'A',
        
            link: function (scope, element, attr) {
                
                element.bind('keydown', function (e) {
                    
                    if (e.which == 13)  {
                        scope.tempo = parseInt(scope.tempo);

                        if (isNaN(scope.tempo) || scope.tempo < 0) {
                            scope.$emit("error:message", 'Please enter a valid integer for the tempo :)');
                            return;
                        }
                        
                        else {
                            
                            doobio.instances[scope.instanceName].env.ids[scope.pattern.id].changeTempo(scope.tempo, true);
                            scope.$emit("success:message", 
                                'You successfully changed '+ scope.name+'`s tempo to ' + scope.tempo +'.', 3000);
                            $(element).blur();
                            
                        }
                    }
                });
            }
        };
    }]);
});