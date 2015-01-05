describe("Model controller functionality", function () {

    var placeholderModel = {

        model: {
            "id": 1,
            "name": "My horse",
            "files": "http://www.nowhereatall.com",
            "upvotes": 20,
            "downvotes": 2,
            "authorName": "Donatello",
            "authorAvatar": "http://i.imgur.com/KgKyXqN.jpg",
            "authorAbout": "I like pizza and my amazing horse.",
            "publicationDate": "2010-04-05T12:38:20.000Z",
            "description": "Look at my horse, my horse is amazing!",
            "visibility": "public",
            "tags": [
                "horse", "amazing"
            ],
            "comments": [
                {
                    "author": "Michelangelo",
                    "avatar": "http://i.imgur.com/PbgQGd1.png",
                    "date": "2011-10-05T14:45:00.000Z",
                    "content": "It tastes just like raisins!"
                },
                {
                    "author": "Leonardo",
                    "avatar": "http://i.imgur.com/EYi19tc.png",
                    "date": "2011-10-05T14:48:00.000Z",
                    "content": "That doesn't look like a horse..."
                }
            ]
        },
        favourited: false,
        followingAuthor: false,
        uservote: 'UP'
    };

    beforeEach(module('ui.router')); // this declaration is mandatory for the tests to work
    beforeEach(module('meshApp'));
    beforeEach(module('meshApp.model'));
    beforeEach(module('meshApp.config'));

    var controller, scope, $httpBackend, serverUrl;
    var stateParams = { id: 1 };
    beforeEach(inject(function ($injector, $controller, $rootScope, server) {

        serverUrl = server.url;

        // Set up the mock http service responses
        $httpBackend = $injector.get('$httpBackend');

        scope = $rootScope.$new();
        controller = $controller('ModelCtrl', {
            $scope: scope,
            $stateParams: stateParams
        });

        $httpBackend.whenGET(serverUrl + '/models/' + stateParams.id).respond(placeholderModel);
        scope.init();
        scope.isLoggedIn = true;
        $httpBackend.flush();

    }));

    afterEach(function () {
        $httpBackend.verifyNoOutstandingExpectation();
        $httpBackend.verifyNoOutstandingRequest();
    });

    it('should be defined', function () {
        expect(controller).toBeDefined();
    });

    it('should decrement the number of upvotes when the upvote button is pressed again', function () {
        // mock the upvote request
        $httpBackend.whenDELETE(serverUrl + '/models/' + stateParams.id + '/votes').respond(200);
        scope.upvote();
        $httpBackend.flush(); // always call flush in order to execute the request
        expect(scope.model.upvotes).toEqual(19);
        expect(scope.userVote).toEqual('');
        expect(scope.model.downvotes).toEqual(2);
    });

    it('should increment the number of downvotes and decrement the number of upvotes when the downvote button is pressed for the first time', function() {
        // mock the downvote request
        $httpBackend.whenPOST(serverUrl + '/models/' + stateParams.id + '/votes').respond(200);
        scope.downvote();
        $httpBackend.flush();
        expect(scope.model.downvotes).toEqual(3);
        expect(scope.userVote).toEqual('DOWN');
        expect(scope.model.upvotes).toEqual(19);
    });

});