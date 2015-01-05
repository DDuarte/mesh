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

    .controller('CatalogCtrl', function ModelController($scope, $stateParams, $http, server, meshApi) {

        $scope.isLoggedIn = meshApi.isLoggedIn();
        if ($scope.isLoggedIn) {
            $scope.loggedUsername = meshApi.getLoggedUsername();
        }

        $scope.newest = {};
        $scope.recommended = {};
        $scope.topRated = {};
        $scope.mostRelevant = {};

        $scope.hasMoreNewModels = false;
        $scope.hasMoreRecommendedModels = false;
        $scope.hasMoreTopRatedModels = false;
        $scope.hasMoreMostRelevantModels = false;


        $scope.loadMostRelevantModels = function () {
            if (!$scope.hasMoreMostRelevantModels) {
                return;
            }

            $scope.hasMoreMostRelevantModels = false;

            meshApi.getMostRelevantModelIds().success(function (data) {

                function getModelSuccess(m) {
                    $scope.mostRelevant.push(m.data.model);
                }

                for (var i = 0; i < data.length; ++i) {
                    meshApi.getModel(data[i]).then(getModelSuccess);
                }

                if (data.length >= 10) {
                    $scope.hasMoreMostRelevantModels = true;
                }
            }).error(function (data, status) {
                alert('Error ' + status + ' occurred: ' + data.message);
                $scope.hasMoreMostRelevantModels = true;
            });
        };

        $scope.loadTopRatedModels = function () {
            if (!$scope.hasMoreTopRatedModels) {
                return;
            }

            $scope.hasMoreTopRatedModels = false;

            meshApi.getTopRatedModelIds().success(function (data) {

                function getModelSuccess(m) {
                    $scope.topRated.push(m.data.model);
                }

                for (var i = 0; i < data.length; ++i) {
                    meshApi.getModel(data[i]).then(getModelSuccess);
                }

                if (data.length >= 10) {
                    $scope.hasMoreTopRatedModels = true;
                }
            }).error(function (data, status) {
                alert('Error ' + status + ' occurred: ' + data.message);
                $scope.hasMoreTopRatedModels = true;
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

        $scope.loadRecommendedModels = function () {
            if (!$scope.hasMoreRecommendedModels || !$scope.isLoggedIn) {
                return;
            }

            $scope.hasMoreRecommendedModels = false;

            meshApi.getRecommendedOlderThan( $scope.recommended.length > 0 ? ($scope.recommended[$scope.recommended.length-1].date) : null).
                success( function (data, status, headers, config) {
                    for (var i = 0; i < data.length; ++i) {
                        $scope.recommended.push(data[i]);
                    }

                    if (data.length >= 10) {
                        $scope.hasMoreRecommendedModels = true;
                    }
                }).
                error( function (data, status, headers, config) {
                    alert('Error ' + status + ' occurred: ' + data.message);
                    $scope.hasMoreRecommendedModels = true;
                });
        };

        $scope.init = function () {
            meshApi.getMostRelevantModelIds().then(function (data) {

                var modelPromises = data.data.map(function (id) {
                    return meshApi.getModel(id);
                });

                Promise.all(modelPromises).then(function (models) {
                    $scope.mostRelevant = models.map(function (m) {
                        return m.data.model;
                    });
                }, function (err) {
                    alert(err);
                });

                if (data.length >= 10) {
                    $scope.hasMoreMostRelevantModels = true;
                }
            }, function (data, status) {
                alert('Error ' + status + ' occurred: ' + data.message);
                $scope.hasMoreMostRelevantModels = true;
            });

            if ($scope.isLoggedIn) {
                meshApi.getRecommendedOlderThan($scope.recommended[0] ? $scope.recommended[$scope.recommended.length-1].date : null).
                    success( function (data, status, headers, config) {
                        $scope.recommended = data;

                        if (data.length >= 10) {
                            $scope.hasMoreRecommendedModels = true;
                        }
                        console.log($scope.recommended);
                    }).
                    error( function (data, status, headers, config) {
                        alert('Error ' + status + ' occurred: ' + data.message);
                        $scope.hasMoreRecommendedModels = true;
                    });
            }

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

            meshApi.getTopRatedModelIds().then(function (data) {

                var modelPromises = data.data.map(function (id) {
                    return meshApi.getModel(id);
                });

                Promise.all(modelPromises).then(function (models) {
                    $scope.topRated = models.map(function (m) { return m.data.model; });
                }, function (err) {
                    alert(err);
                });

                if (data.length >= 10) {
                    $scope.hasMoreTopRatedModels = true;
                }
            }, function (data, status) {
                alert('Error ' + status + ' occurred: ' + data.message);
                $scope.hasMoreTopRatedModels = true;
            });

        };
    });
