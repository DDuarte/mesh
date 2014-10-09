angular.module('meshApp.register', [
    'ui.router'
])

    .config(function config($stateProvider) {
        $stateProvider.state('register', {
            url: '/register',
            controller: 'RegisterCtrl',
            templateUrl: 'register/register.tpl.html',
            data: { pageTitle: 'Register' }
        });
    })

    .controller('RegisterCtrl', function LoginController($scope) {
        $scope.init = function () {
            angular.element('body').css("background-color","#428bca");
        };
    });
