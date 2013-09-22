define(['directives/directives'], function(directives){

    directives.directive('spNameInput', ['doobio', function (doobio) {

        return {
            restrict: 'A',
            link: function (scope, element, attr) {
                
                element.bind('keydown', function (e) {
                    
                    if (e.which == 13)  {
                        if (doobio.instances[scope.instanceName].env.assets[scope.name]) {
                            scope.$emit("error:message", 
                                'Please try another name! There`s another pattern named '+ scope.name+'. ');
                            scope.$apply();
                            
                        }
                        else {
                            /** get an id for the new pattern */
                            var promise = doobio.requestID();
                            promise.then(function(id){
                                
                                var tempo = !isNaN(parseInt(scope.tempo)) ? parseInt(scope.tempo) : 120;
                                var steps = !isNaN(parseInt(scope.steps)) ? parseInt(scope.steps) : 32;

                                var p = doobio.instances[scope.instanceName].soundPattern({
                                    name: scope.name,
                                    id: id,
                                    tempo: tempo,
                                    steps: steps
                                }, true);

                                p.then(function(_pattern){
                                    $('#spname').blur();
                                    $('#spnamedropdown').hide();
                                    scope.$emit("success:message", 
                                        'Pattern '+ scope.name+' was successfully created.', 3000);

                                    /*
                                    *   set the mapping (patternInfo) on sp-ctrl
                                    */
                                    scope.mappings[_pattern._id] = _pattern;
                                    
                                }, function(e){
                                    scope.$emit("error:message", e);
                                    scope.$apply();
                                });
                                
                            }, function(){
                                scope.$emit("error:message", 'An error occured in creating you pattern. Could you please try again?');
                                scope.$apply();
                            });
                        }
                    }
                    
                });
            }
        };
    }]);
});