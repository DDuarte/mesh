angular.module('meshApp.search', [
    'ui.router', 'ui.bootstrap'
])
    .config(function config($stateProvider) {
        $stateProvider.state('home.search', {
            url: '/search?q',
            controller: 'SearchCtrl',
            templateUrl: 'search/search.tpl.html',
            data: { pageTitle: 'Search' }
        });
    })

    .filter('startFrom', function() {
        return function(input, start) {
            start = +start; //parse to int
            return input.slice(start);
        };
    })

    .controller('SearchCtrl', function SearchController($scope, $stateParams, meshApi) {

        $scope.models = [];
        $scope.users = [];
        $scope.groups = [];

        $scope.changeSearchType = function(searchType) {
            $scope.searchType = searchType;
        };

        $scope.init = function() {
            meshApi.search($stateParams.q)
                .success(function(data) {
                    console.log(data);
                    $scope.models = data.models;
                    $scope.groups = data.groups;
                    $scope.users = data.users;
                })
                .error(function(error) {
                    console.log("Error");
                });

            $scope.changeSearchType('model');
            $scope.search = {
                query: $stateParams.q
            };
        };
    });