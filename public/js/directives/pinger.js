define(['directives/directives'], function(directives){

    directives.directive('pinger', ['auth', function (auth) {

        return {
            restrict: 'A',
            // scope: {
            //     ev: '='
            // },
            link: function (scope, element, attr) {
                
                element.bind('click', function (e) {

                    auth.authenticate();
                    
                });
            }
        };
    }]);
});