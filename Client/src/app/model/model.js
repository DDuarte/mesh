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
    "comments": [
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
            link: function postLink($scope, $element, $attrs) {
                var camera, scene, renderer, mesh;

                var done = false;

                $scope.init = function () {
                    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 10000);
                    camera.position.z = 1000;

                    scene = new THREE.Scene();

                    var canvas = document.createElement('canvas');
                    canvas.width = angular.element('#rendererContainer').innerWidth();
                    canvas.height = angular.element('#rendererContainer').innerWidth() * 9 / 16;

                    mesh = new THREE.Mesh(
                        new THREE.BoxGeometry(400, 400, 400),
                        new THREE.MeshBasicMaterial({ color: 0xff00ff, wireframe: true })
                    );

                    scene.add(mesh);

                    renderer = new THREE.WebGLRenderer({ antialias: true });
                    renderer.setClearColor(0xffffff, 1);
                    renderer.setSize(angular.element('#rendererContainer').innerWidth(), angular.element('#rendererContainer').innerWidth() * 9 / 16);

                    $element.append(angular.element(renderer.domElement));

                    window.addEventListener('resize', $scope.onWindowResize, false);
                };

                $scope.onWindowResize = function () {
                    renderer.setSize(angular.element('#rendererContainer').innerWidth(), angular.element('#rendererContainer').innerWidth() * 9 / 16);
                };

                $scope.animate = function () {
                    if (!done) {
                        requestAnimationFrame($scope.animate);
                        mesh.rotation.x += 0.01;
                        mesh.rotation.y += 0.02;
                        $scope.render();
                    }
                };

                $scope.render = function () {
                    renderer.render(scene, camera);
                };

                $scope.$on('$destroy', function () {
                    console.log("$destroy");

                    done = true;

                    scene.remove(mesh);
                    mesh.geometry.dispose();
                    mesh.material.dispose();

                    mesh = scene = camera = renderer = undefined;
                    delete mesh;
                    delete scene;
                    delete camera;
                    delete renderer;
                });

                $scope.init();
                $scope.animate();
            }
        };
    })

    .directive('modelComment', function () {
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
        $scope.model = placeholderModel; //TODO replace this with actual model GET
        $scope.favourited = false; //TODO check if model is already favourited
        $scope.followingAuthor = false; //TODO

        $scope.newModel = {};
        $scope.newModel.description = $scope.model.description;
        $scope.newModel.tags = $scope.model.tags;
        $scope.newModel.visibility = $scope.model.visibility;

        $scope.tabs = {comments: false, details: true, settings: false};

        $scope.newComment = '';
        $scope.submitNewComment = function () {
            alert('Not yet implement. Comment:\n' + $scope.newComment);
        };

        $scope.loadTags = function ($query) {
            //return $http.get('/tags?query=' + $query);
            var def = $q.defer();
            def.resolve(['3D','Model','Autocompleting tags','Mesh']);
            return def.promise;
        };

        $scope.upvote = function () {
            alert('Upvote not yet implemented');
        };
        $scope.downvote = function () {
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