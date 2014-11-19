angular.module('meshApp.login', [
    'ui.router', 'ui.bootstrap'
])

    .config(function config($stateProvider) {
        $stateProvider.state('login', {
            url: '/login?state',
            controller: 'LoginCtrl',
            templateUrl: 'login/login.tpl.html',
            data: { pageTitle: 'Login | Mesh' }
        });
    })

    .controller('LoginCtrl', function LoginController($scope, $stateParams, $state, authorization, meshApi) {
        $scope.init = function () {
            angular.element('body').css("background-color","#428bca");
        };

        $scope.state = $stateParams.state;

        $scope.loginInfo = {};

        $scope.login = function() {
            var credentials = $scope.loginInfo;

            var success = function (data) {
                meshApi.init(data);

                $state.go('home.profile');
            };

            var error = function (err) {
                console.log(JSON.stringify(err));
                $scope.loginError = err.message ? err.message : err;
            };

            authorization.login(credentials).success(success).error(error);
        };
    });
