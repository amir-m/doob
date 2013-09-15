define(['directives/directives'], function(directives){

    directives.directive('spNameInput', ['doobio', function (doobio) {

        return {
            restrict: 'A',
            // scope: {
            //     ev: '='
            // },
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

                                doobio.instances[scope.instanceName].soundPattern({
                                    name: scope.name,
                                    id: id,
                                    tempo: tempo,
                                    steps: steps
                                }, true);
                                $('#spname').blur();
                                $('#spnamedropdown').hide();
                                scope.$emit("success:message", 
                                    'Pattern '+ scope.name+' was successfully created.', 3000);
                                // scope.$apply();
                                
                            }, function(){
                                scope.$emit("error:message", 'An error occured in creating you patter. Could you please try again?');
                                scope.$apply();
                            });
                        }
                    }
                });
                // element.bind('blur', function(e){
                //     $("#spnamedropdown").fadeOut();
                //     scope.$emit("clear:message");
                // })
            }
        };
    }]);
});