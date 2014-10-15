var placeholderModel = {
    "name": "My horse",
    "files": "http://www.nowhereatall.com",
    "upvotes": 20,
    "downvotes": 2,
    "authorName": "Donatello",
    "authorAvatar": "http://i.imgur.com/KgKyXqN.jpg",
    "authorAbout": "I like pizza and my amazing horse.",
    "publicationDate": "2010-04-05T12:38:20.000Z",
    "description" : "Look at my horse, my horse is amazing!",
    "visibility" : "public",
    "tags": [
        "horse", "amazing"
    ],
    "comments" :[
        {
            "author": "Michelangelo",
            "avatar": "http://i.imgur.com/PbgQGd1.png",
            "date": "2011-10-05T14:45:00.000Z",
            "content": "It tastes just like raisins!"
        },
        {
            "author": "Leonardo",
            "avatar": "http://i.imgur.com/EYi19tc.png?1",
            "date": "2011-10-05T14:48:00.000Z",
            "content": "That doesn't look like a horse..."
        }
    ]
};

angular.module('meshApp.model', [
    'ui.router'
])
    .directive('visualizer', function () {
        return {
            restrict: 'AE',
            // replace: 'true',
            link: function (scope, element, attrs) {
                scene = new THREE.Scene();

                camera = new THREE.PerspectiveCamera(75, 16 / 9, 1, 10000);
                camera.position.z = 1000;

                geometry = new THREE.BoxGeometry(400, 400, 400);
                material = new THREE.MeshBasicMaterial({ color: 0xff00ff, wireframe: true });

                mesh = new THREE.Mesh(geometry, material);
                scene.add(mesh);

                renderer = new THREE.CanvasRenderer();
                renderer.setSize(angular.element('#rendererContainer').innerWidth(), angular.element('#rendererContainer').innerWidth()*9/16);
                renderer.setClearColor(0xffffff, 1);

                window.addEventListener('resize', function() {
                    renderer.setSize(angular.element('#rendererContainer').innerWidth(), angular.element('#rendererContainer').innerWidth()*9/16);
                }, false);

                element.append(angular.element(renderer.domElement));

                animate();

                function animate() {
                    requestAnimationFrame(animate);

                    mesh.rotation.x += 0.01;
                    mesh.rotation.y += 0.02;

                    renderer.render(scene, camera);
                }
            }
        };
    })

    .directive('modelComment', function() {
        return {
            restrict: 'E',
            transclude: true,
            replace: true,
            scope: {
                authorName: '@author',
                authorImg: '@avatar',
                commentDate: '@date'
            },
            templateUrl: 'model/modelcomment.tpl.html'
        };
    })

    .config(function config($stateProvider) {
        $stateProvider.state('home.model', {
            url: '/model',
            controller: 'ModelCtrl',
            templateUrl: 'model/model.tpl.html',
            data: { pageTitle: 'model' }
        });
    })

    .controller('ModelCtrl', function ModelController($scope, $q/*, $http*/) {
        $scope.model=placeholderModel; //TODO replace this with actual model GET
        $scope.favourited = false; //TODO check if model is already favourited
        $scope.followingAuthor = false; //TODO

        $scope.newModel = {};
        $scope.newModel.description = $scope.model.description;
        $scope.newModel.tags = $scope.model.tags;
        $scope.newModel.visibility = $scope.model.visibility;

        $scope.tabs = {comments: false, details: true, settings: false};

        $scope.newComment = '';
        $scope.submitNewComment = function() {
            alert('Not yet implement. Comment:\n' + $scope.newComment);
        };

        $scope.loadTags = function ($query) {
            //return $http.get('/tags?query=' + $query);
            var def = $q.defer();
            def.resolve(['3D','Model','Autocompleting tags','Mesh']);
            return def.promise;
        };

        $scope.upvote = function() {
            alert('Upvote not yet implemented');
        };
        $scope.downvote = function() {
            alert('Downvote not yet implemented');
        };
        $scope.favouriteModel = function () {
            alert('Favourite model not yet implemented');
            $scope.favourited = !$scope.favourited;
        };
        $scope.followAuthor = function () {
            alert('Follow author not yet implemented');
            $scope.followingAuthor = !$scope.followingAuthor;
        };
        $scope.downloadModel = function () {
            alert('Download not yet implemented');
        };
        $scope.exportModel = function () {
            alert('Export to dropbox not yet implemented');
        };
        $scope.updateModel = function () {
            alert('Save model not yet implemented');
        };
        $scope.deleteModel = function () {
            alert('Delete model not yet implemented');
        };
    });