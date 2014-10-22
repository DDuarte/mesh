angular.module('meshApp.profile', [
    'ui.router'
])
    .config(function config($stateProvider) {
        $stateProvider.state('home.profile', {
            url: '/profile/:id',
            controller: 'ProfileCtrl',
            templateUrl: 'profile/profile.tpl.html',
            data: { pageTitle: 'Profile | Mesh' }
        });
    })

    .controller('ProfileCtrl', function ProfileController($scope, $stateParams, $http, server) {
        $scope.init = function() {
            $http.get(server.url + '/users/' + $stateParams.id). // TODO: make url configurable?
                success(function (data, status, headers, config) {
                    $scope.user = data;
                });
        };
    });
