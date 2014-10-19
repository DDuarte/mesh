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

    .controller('SearchCtrl', function SearchController($scope, $stateParams) {
        $scope.init = function() {

            $scope.results = [
                { name: 'Barbarian Dude', type: 'model', image: 'https://d35krx4ujqgbcr.cloudfront.net/urls/a41a7db45fd64dc7ba6a897c2606e1c7/thumbnails/b5683002a16d43299e5da5dce8757ae3/640.jpeg' },
                { name: 'Galileo Orbiter', type: 'model', image: 'https://d35krx4ujqgbcr.cloudfront.net/urls/19c3c6e0c1b548919d11681065fcf65a/thumbnails/53ecf4a0c65f461d8d948e202f97afda/640.jpeg' },
                { name: 'Inferno Bot', type: 'model', image: 'https://d35krx4ujqgbcr.cloudfront.net/urls/dbd3a6a4347b443c9eeb4a8f83e394dc/thumbnails/951ad84c388a4f6e8252031c48ae80ad/640.jpeg' },
                { name: 'Naige', type: 'model', image: 'https://d35krx4ujqgbcr.cloudfront.net/urls/0258e96fad5b4983996f8e0e6aeb06ae/thumbnails/b4fd74bfcd984e4fb1415bfc0eaa1b98/640.jpeg' },
                { name: 'RaceShip 2014', type: 'model', image: 'https://d35krx4ujqgbcr.cloudfront.net/urls/3118e73ee04e4bbaad5b55797073e2b7/thumbnails/bb351b935db04a1baa02785fb4d406b4/640.jpeg' },
                { name: 'Battle of Apes', type: 'model', image: 'https://d35krx4ujqgbcr.cloudfront.net/urls/95221e20ae1a47fb8d4937b5bda36643/thumbnails/c36dc467d4af439ca9ecb85b57bf3210/640.jpeg'},
                { name: 'Dropship Interior', type: 'model', image: 'https://d35krx4ujqgbcr.cloudfront.net/urls/bf9000ac96394293be214550335ed602/thumbnails/833d548e087a4987b7150d04aadb515f/640.jpeg'},
                { name: 'House 2', type: 'model', image: 'https://d35krx4ujqgbcr.cloudfront.net/urls/59425a7a20024357841404ee009baa08/thumbnails/a792e380917a4a189b90266654ab011b/640.jpeg'},
                { name: 'F1 Tyre', type: 'model', image: 'https://d35krx4ujqgbcr.cloudfront.net/urls/ca1af608713a46539093b37015ce447b/thumbnails/a218e44bc3824614b4516906da726aaf/640.jpeg'},

                { name: 'YMCA', type: 'group', image: 'http://storage.canoe.ca/v1/dynamic_resize/?src=http://slam.canoe.ca/Slam/Olympics/2014Sochi/2013/12/19/village650.jpg&size=650x366&quality=85'},
                { name: 'NeCG', type: 'group', image: 'http://necg.fe.up.pt/assets/logo-44ff72b37e32f96db00c8f8982df9e1f.png'},

                { name: 'Chuck Norris', type: 'user', image: 'http://eagnews.org/wp-content/uploads/2013/11/chuck-norris-07.jpg'}
            ];

            $scope.searchType = 'model';
            angular.element('#model').addClass('active');

            $scope.currentPage = 1;
            $scope.pageSize = 4;

            $scope.search = {
                query: $stateParams.q
            };
        };

        $scope.changeSearchType = function(searchType) {
            if ($scope.searchType === '') {
                $scope.searchType = 'all';
            }
            angular.element('#' + $scope.searchType).removeClass('active');

            $scope.searchType = searchType;
            $scope.currentPage = 1;

            if (searchType === '') {
                searchType = 'all';
            }
            angular.element('#' + searchType).addClass('active');
        };

        $scope.setPage = function (pageNo) {
            $scope.currentPage = pageNo;
        };

        $scope.pageChanged = function() {
            console.log('Page changed to: ' + $scope.currentPage);
        };
    });