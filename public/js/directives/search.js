define(['directives/directives'], function(directives){

    directives.directive('search', ['$http', '$rootScope', function ($http) {

        return {
            restrict: 'A',
            // scope: {
            //     ev: '='
            // },
            link: function (scope, element, attr) {

                scope.searchUsers = [];
                scope.searchSP = [];
                
                element.bind('focus', function (e) {

                    $('#srchrslt').slideDown(200);
                    $('#noresults').hide();

                    scope.searchUsers = [];
                    scope.searchSP = [];
                    
                });

                $('#barloader').hide();

                element.bind('keyup', function (e) {
                    scope.searchUsers = [];
                    scope.searchSP = [];

                    if (e.which !== 9 && e.which != 27) {
                        $('#barloader').show();
                        $('#noresults').hide();

                        $http.get('/search?q='+$('#q').val()).success(function(data, status){
                            $('#barloader').hide();
                            if (data.length == 0) {
                                $('#noresults').show();
                            }
                            else {
                                scope.searchUsers = data[0];
                                scope.searchSP = data[1];
                            }
                        }).error(function(data){
                            $('#noresults').show();
                        })
                    }
                    if (e.which == 27) {
                        $('#q').blur();
                        scope.searchUsers = [];
                        scope.searchSP = [];
                    }
                });
                
            

                element.bind('blur', function (e) {
                    // e.stopPropagation();
                    $('#noresults').hide();
                    $('#srchrslt').slideUp(200);
                    $('#q').val('');
                    scope.searchUsers = [];
                    scope.searchSP = [];
                });
                
            }
        };
    }]);
});