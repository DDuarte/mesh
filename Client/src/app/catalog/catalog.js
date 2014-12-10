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

        $scope.newest = {};

        $scope.hasMoreNewModels = false;

        $scope.init = function () {
            meshApi.getModelsOlderThan( $scope.newest[0] ? $scope.newest[$scope.newest.length-1].date : null).
            success( function (data, status, headers, config) {
                $scope.newest = data;

                if (data.length >= 10) {
                    $scope.hasMoreNewModels = true;
                }
            }).
            error( function (data, status, headers, config) {
                alert('Error ' + status + ' occurred: ' + data.message);
                $scope.hasMoreNewModels = true;
            });
        };

        $scope.loadNewestModels = function () {
            if (!$scope.hasMoreNewModels) {
                return;
            }
            $scope.hasMoreNewModels = false;

            meshApi.getModelsOlderThan( $scope.newest.length > 0 ? ($scope.newest[$scope.newest.length-1].date) : null).
                success( function (data, status, headers, config) {
                    for (var i = 0; i < data.length; ++i) {
                        $scope.newest.push(data[i]);
                    }

                    if (data.length >= 10) {
                        $scope.hasMoreNewModels = true;
                    }
                }).
                error( function (data, status, headers, config) {
                    alert('Error ' + status + ' occurred: ' + data.message);
                    $scope.hasMoreNewModels = true;
                });
        };
    });