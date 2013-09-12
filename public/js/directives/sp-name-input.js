define(['directives/directives'], function(directives){

    directives.directive('spNameInput', ['doobio', function (doobio) {

        return {
            restrict: 'A',
            // scope: {
            //     ev: '='
            // },
            link: function (scope, element, attr) {
                scope.name = '';
                scope.msg = '';
                element.bind('keydown', function (e) {
                    // console.log(element)
                    // console.log(e)
                    scope.msg = '';
                    // scope.$apply()
                    if (e.which == 13)  {
                        if (doobio.instances[scope.instanceName].env.assets[scope.name]) {
                            scope.msg = 'Please try another name! There`s another pattern named '
                            + scope.name+'. ';
                            scope.$apply()
                        }
                        else {
                            doobio.instances[scope.instanceName].soundPattern({
                                name: scope.name
                            }, true);
                            $('#spname').blur();
                            $('#spnamedropdown').hide();
                            scope.$apply();
                        }
                    }
                });
                // element.bind('mouseenter', function(e){
                //     scope.$apply(function(){
                //         console.log(e)
                //     })
                // })
            }
        };
    }]);
});