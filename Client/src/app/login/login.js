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

    .controller('LoginCtrl', function LoginController($scope, $state, /*$cookieStore,*/ authorization, meshApi) {
        $scope.init = function () {
            angular.element('body').css("background-color","#428bca");
        };

        $scope.loginInfo = {};

        $scope.login = function() {
            var credentials = $scope.loginInfo;

            var success = function (data) {
                var token = data.token;

                meshApi.init(token);

                // $cookieStore.put('token', token);
                $state.go('home.profile');
            };

            var error = function (err) {
                console.log(err);
                $scope.loginError = err;
            };

            authorization.login(credentials).success(success).error(error);
        };
    });
