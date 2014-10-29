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

    .controller('LoginCtrl', function LoginController($scope, $state, /*$cookieStore,*/ authorization, api) {
        $scope.init = function () {
            angular.element('body').css("background-color","#428bca");
        };

        $scope.loginInfo = {};

        $scope.login = function() {
            var credentials = $scope.loginInfo;
            console.log(credentials);

            var success = function (data) {
                console.log("inside");
                var token = data.token;

                api.init(token);

                // $cookieStore.put('token', token);
                $state.go('home.profile');
            };

            var error = function (err) {
                console.log(err);
                // TODO: apply user notification here..
            };

            authorization.login(credentials).success(success).error(error);
        };
    });
