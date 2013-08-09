describe('test', function(){
    var $httpBackend, Auth, $rootScope, createController, $location;

    beforeEach(module('hm'));

    beforeEach(

        inject(function($injector) {
            $httpBackend = $injector.get('$httpBackend');
            // backend definition common for all tests
            $httpBackend.when('POST', '/login').respond({
                username: 'amir',
                activities: ['changed password', 'shared resource']
            });

            $rootScope = $injector.get('$rootScope');
            $location = $injector.get('$location');
            Auth = $injector.get('Auth');
            var $controller = $injector.get('$controller');

            createController = function() {
                return $controller('LoginCtrl', {
                    '$scope' : $rootScope,
                    'Auth': Auth,
                    '$location': $location
                });
            };

        })
    );

    it ('dummy!', function(){
        expect(1).toEqual(1);
        $httpBackend.expectGET('/login').respond(200);
        var controller = createController();
//        controller.login()
//        $httpBackend.flush();
    });

    afterEach(function() {
//        console.log(createController());
        $httpBackend.verifyNoOutstandingExpectation();
        $httpBackend.verifyNoOutstandingRequest();
    });




});
