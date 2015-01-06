angular.module('meshApp.notFound', [
    'ui.router', 'ui.bootstrap'
])

    .config(function config($stateProvider) {
        $stateProvider.state('home.notFound', {
            url: '/404',
            controller: 'NotFoundCtrl',
            templateUrl: '404/404.tpl.html',
            data: { pageTitle: 'Not found | Mesh' }
        });
    })

    .controller('NotFoundCtrl', function NotFoundController() {

    });