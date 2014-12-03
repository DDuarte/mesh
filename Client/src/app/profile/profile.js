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
    });
