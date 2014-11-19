angular.module('meshApp.activate', [
    'ui.router'
])

    .config(function config($stateProvider) {
        $stateProvider.state('activate', {
            url: '/activate?token&username',
            controller: 'ActivateCtrl',
            /* templateUrl: 'activate/activate.tpl.html', */
            data: { pageTitle: 'Activation | Mesh' }
        });
    })

    .controller('ActivateCtrl', function ActivateController($stateParams, $scope, $state, meshApi) {
        $scope.init = (function () {
            var token = $stateParams.token;
            var username = $stateParams.username;

            var success = function() {
                $state.go('login', {state: 'successActivation'});
            };

            var error = function() {
                $state.go('login', {state: 'failedActivation'});
            };

            meshApi.validateAccount(username, token).success(success).error(error);
        })();
    });
