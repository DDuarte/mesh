angular.module('meshApp.catalog', [
    'ui.router', 'ui.bootstrap'
])

    .config(function config($stateProvider) {
        $stateProvider.state('home.catalog', {
            url: '/catalog',
            controller: 'CatalogCtrl',
            templateUrl: 'catalog/catalog.tpl.html',
            data: { pageTitle: 'Catalog | Mesh' }
        });
    })

    .controller('CatalogCtrl', function ModelController($scope, $stateParams, $http, server, meshApi, ngDialog) {

        $scope.isLoggedIn = meshApi.isLoggedIn();
        if ($scope.isLoggedIn) {
            $scope.loggedUsername = meshApi.getLoggedUsername();
        }

    });