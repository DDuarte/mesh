angular.module('meshApp.search', [
    'ui.router'
])
    .config(function config($stateProvider) {
        $stateProvider.state('home.search', {
            url: '/search',
            controller: 'SearchCtrl',
            templateUrl: 'search/search.tpl.html',
            data: { pageTitle: 'Search' }
        });
    })

    .service('SearchService', function SearchService() {
        var search = {
            query: null
        };

        return {
            getQuery: function() { return search.query; },
            setQuery: function(query) { search.query = query; }
        };
    })

    .controller('SearchCtrl', function SearchController($scope, SearchService) {
        $scope.init = function() {
        };
        $scope.search = {
            query: SearchService.getQuery()
        };
    });