angular.module('meshApp.search', [
    'ui.router'
])
    .config(function config($stateProvider) {
        $stateProvider.state('home.search', {
            url: '/search?q',
            controller: 'SearchCtrl',
            templateUrl: 'search/search.tpl.html',
            data: { pageTitle: 'Search' }
        });
    })

    .controller('SearchCtrl', function SearchController($scope, $stateParams) {
        $scope.init = function() {
            $scope.search = {
                query: $stateParams.q
            };
        };
    });