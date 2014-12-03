angular.module('meshApp.profile', [
    'ui.router'
])
    .config(function config($stateProvider) {
        $stateProvider.state('home.profile', {
            url: '/profile/:username',
            controller: 'ProfileCtrl',
            templateUrl: 'profile/profile.tpl.html',
            data: { pageTitle: 'Profile | Mesh' }
        });
    })

    .controller('ProfileCtrl', function ProfileController($scope, $stateParams, $http, server, meshApi) {
        $scope.init = function() {
            $http.get(server.url + '/users/' + $stateParams.username). // TODO: make url configurable?
                success(function (data) {
                    $scope.user = data;
                });
        };

        $scope.getFollowers = function () {
            meshApi.getFollowers($scope.user.username).success(function (data) {
                $scope.user.followers = data;
            });
        };

        $scope.getFollowing = function () {
            meshApi.getFollowing($scope.user.username).success(function (data) {
                $scope.user.following = data;
            });
        };

        var models = function (g) { return _.range(10).map(function (i) { return { name: "Model " + g + "-" + i }; }); };
        $scope.galleries = _.range(10).map(function (i) { return { name: "Gallery " + i, models: models(i) }; });

        $scope.orderByField = 'username';
        $scope.reverseSort = false;
    });
