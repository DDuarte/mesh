angular.module('meshApp.login', [
    'ui.router'
])

    .config(function config($stateProvider) {
        $stateProvider.state('login', {
            url: '/login',
            controller: 'LoginCtrl',
            templateUrl: 'login/login.tpl.html',
            data: { pageTitle: 'Login' }
        });
    })

    .controller('LoginCtrl', function LoginController($scope) {
        $scope.init = function () {
            angular.element('body').css("background-color","#428bca");
        };

        $scope.loginInfo = {};

        $scope.login = function() {
            alert("Not yet implemented:\n"+JSON.stringify($scope.loginInfo, null, '\t'));
        };
    });
