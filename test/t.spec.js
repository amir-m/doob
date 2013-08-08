describe('test', function(){
    var $httpBackend, Auth, $rootScope, createController, $location;

    beforeEach(

        inject(function($injector) {
            $httpBackend = $injector.get('$httpBackend');
            // backend definition common for all tests
            $httpBackend.when('GET', '/me').respond({
                username: 'amir',
                activities: ['changed password', 'shared resource']
            });

            $rootScope = $injector.get('$rootScope');
            $location = $injector.get('$location');
            Auth = $injector('Auth');
            var $controller = $injector.get('$controller');

            createController = function() {
                return $controller('LoginCtrl', {'$scope' : $rootScope });
            };

        })
    );

    it ('dummy!', function(){
        expect(1).toEqual(1);
        $httpBackend.expectGET('/me');
        var controller = createController();
        $httpBackend.flush();
    });

    afterEach(function() {
//        console.log(createController());
        $httpBackend.verifyNoOutstandingExpectation();
        $httpBackend.verifyNoOutstandingRequest();
    });




});
