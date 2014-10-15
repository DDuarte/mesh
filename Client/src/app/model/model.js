var placeholderModel = {
    "name": "The Box",
    "files": "http://www.nowhereatall.com",
    "upvotes": "20",
    "downvotes": "2",
    "authorName": "Donatello",
    "authorAvatar": "http://i.imgur.com/KgKyXqN.jpg",
    "authorAbout": "I like pizza and deep philosophical conundrums.",
    "publicationDate": "2010-04-05T12:38:20.000Z",
    "description" : "what have you done to me?\na miasma of darkness as perceptions crawl.\nonce we savored wonder,\ninnocent and untainted,\nbut your desire paled.\na feverish morass of darkness -\nmemories follow darkness, follow bitterness,\nlove dissolved.\nin a haze of sorrow,\nI see you.",
    "comments" :[
        {
            "author": "Michelangelo",
            "avatar": "http://i.imgur.com/PbgQGd1.png",
            "date": "2011-10-05T14:45:00.000Z",
            "content": "Slender beams of moonlight enter this darkened chamber as I kneel, always a slave, always lost, frozen here, waiting.\nHaloed forms wrought in panes of glass loom as dust dances in the air, forming an image in my mind, reaving my darkened soul.\nRealization dawning on my face.\nI raise my head, now submitting to this uncaring truth."
        },
        {
            "author": "Leonardo",
            "avatar": "http://i.imgur.com/EYi19tc.png?1",
            "date": "2011-10-05T14:48:00.000Z",
            "content": "Lol, wut?"
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

                camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 10000);
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

    .controller('ModelCtrl', function ModelController($scope, $window) {
        $scope.model=placeholderModel; //TODO replace this with actual model GET
        $scope.favourited = false; //TODO check if model is already favourited
        $scope.followingAuthor = false; //TODO

        $scope.tabs = {comments: false, details: true, settings: false};

        $scope.newComment = '';
        $scope.submitNewComment = function() {
            alert('Not yet implement. Comment:\n' + $scope.newComment);
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
    });