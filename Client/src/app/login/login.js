angular.module('meshApp.login', [
    'ui.router', 'ui.bootstrap'
])

    .config(function config($stateProvider) {
        $stateProvider.state('login', {
            url: '/login?state&token&email',
            controller: 'LoginCtrl',
            templateUrl: 'login/login.tpl.html',
            data: { pageTitle: 'Login | Mesh' }
        });
    })

    .controller('LoginCtrl', function LoginController($scope, $stateParams, $state, authorization, meshApi, ngDialog, particles) {
        $scope.init = function () {
            angular.element('body').css("background-color","#428bca");
            particles.init();

            if ($stateParams.state == 'forgotPassword') {
                ngDialog.openConfirm({
                    template: 'changePasswordDialogId',
                    className: 'ngdialog-theme-default'
                }).then(function (password) {

                    var openDialog = function (msg) {
                        ngDialog.open({
                            template: 'changePasswordDialog2Id',
                            className: 'ngdialog-theme-default',
                            data: msg
                        });
                    };

                    meshApi.changePassword($stateParams.email, $stateParams.token, password).then(function () {
                        openDialog('Password changed successfully. Login now.');
                    }, function (err) {
                        if (err && err.data && err.data.message) {
                            openDialog(err.data.message);
                        } else {
                            openDialog('An error occurred.');
                        }
                    });
                });
            }
        };

        $scope.state = $stateParams.state;

        $scope.loginInfo = {};

        $scope.login = function() {
            var credentials = $scope.loginInfo;

            var success = function (data) {
                meshApi.init(data);

                $state.go('home.profile', { username: meshApi.getLoggedUsername() });
            };

            var error = function (err) {
                $scope.loginError = err.message ? err.message : err;
            };

            authorization.login(credentials).success(success).error(error);
        };

        $scope.showForgotPassword = function() {
            ngDialog.openConfirm({
                template: 'forgotPasswordDialogId',
                className: 'ngdialog-theme-default'
            }).then(function (email) {
                meshApi.forgotPassword(email).then(function () {}, function () {});
                ngDialog.open({
                    template: 'forgotPasswordDialog2Id',
                    className: 'ngdialog-theme-default'
                });
            });
        };
    });
