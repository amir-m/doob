define(['directives/directives'], function(directives){

    directives.directive('stopEvent', [function () {
        
        return {
            restrict: 'A',
            // scope: {
            //     ev: '='
            // },
            link: function (scope, element, attr) {
                element.bind(attr.stopEvent, function (e) {
                    e.stopPropagation();
                });
            }
        };
    }]);
});