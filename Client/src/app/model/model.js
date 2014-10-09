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
                renderer.setSize(window.innerWidth, window.innerHeight);

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

    .config(function config($stateProvider) {
        $stateProvider.state('home.model', {
            url: '/model',
            controller: 'ModelCtrl',
            templateUrl: 'model/model.tpl.html',
            data: { pageTitle: 'model' }
        });
    })

    .controller('ModelCtrl', function ModelController($scope) {
    });