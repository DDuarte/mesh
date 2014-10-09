angular.module('meshApp.profile', [
    'ui.router'
])
    .config(function config($stateProvider) {
        $stateProvider.state('home.profile', {
            url: '/profile',
            controller: 'ProfileCtrl',
            templateUrl: 'profile/profile.tpl.html',
            data: { pageTitle: 'profile' }
        });
    })

    .controller('ProfileCtrl', function ProfileController($scope) {
    });