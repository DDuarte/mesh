angular.module('meshApp.login', [
    'ui.router'
])

    .config(function config($stateProvider) {
        $stateProvider.state('login', {
            url: '/login',
            controller: 'LoginCtrl',
            templateUrl: 'login/login.tpl.html',
            data: { pageTitle: 'Login | Mesh' }
        });
    })

    .controller('LoginCtrl', function LoginController($scope, $state) {
        $scope.init = function () {
            angular.element('body').css("background-color","#428bca");
        };

        $scope.loginInfo = {};

        $scope.login = function() {
            console.log($scope.loginInfo);
            $state.go('home.profile');
        };
    });
