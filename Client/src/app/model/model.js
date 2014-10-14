angular.module('meshApp.model', [
    'ui.router'
])
    .directive('vizualizer', function () {
        return {
            restrict: 'AE',
            // replace: 'true',
            link: function (scope, element, attrs) {
                scene = new THREE.Scene();

                camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 10000);
                camera.position.z = 1000;

                geometry = new THREE.BoxGeometry(200, 200, 200);
                material = new THREE.MeshBasicMaterial({ color: 0xff00ff, wireframe: true });

                mesh = new THREE.Mesh(geometry, material);
                scene.add(mesh);

                renderer = new THREE.CanvasRenderer();
                renderer.setSize(angular.element('#rendererContainer').width(), angular.element('#rendererContainer').width()*9/16);

                window.addEventListener('resize', function() {
                    renderer.setSize(angular.element('#rendererContainer').width(), angular.element('#rendererContainer').width()*9/16);
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

    .controller('ModelCtrl', function ModelController($scope) {
        $scope.tabs = {comments: true, description: false, settings: false};

        $scope.newComment = '';
        $scope.submitNewComment = function() {
            alert('Not yet implement. Comment:\n' + $scope.newComment);
        };
    });