angular.module('meshApp', [
    'templates-app',
    'templates-common',
    'meshApp.config',
    'meshApp.login',
    'meshApp.activate',
    'meshApp.register',
    'meshApp.model',
    'meshApp.catalog',
    'meshApp.home',
    'meshApp.profile',
    'meshApp.messages',
    'meshApp.group',
    'meshApp.search',
    'meshApp.modelUpload',
    'meshApp.groupCreate',
    'ui.router',
    'ui.bootstrap',
    'ui.mesh.verticalTabs',
    'ui.mesh.breadcrum',
    'ui.mesh.modelthumbnail',
    'angularMoment',
    'ngTagsInput',
    'ipCookie',
    'ngDialog',
    'angularSpinner',
    'infinite-scroll',
    'angularFileUpload'
])

    .constant('_', window._)
    .constant('angularMomentConfig', {
        preprocess: 'utc'/*,
         timezone: 'Europe/London'*/
    }
)
    .config(function myAppConfig($stateProvider, $urlRouterProvider, ngDialogProvider) {
        // $httpProvider.responseInterceptors.push('httpInterceptor');
        $urlRouterProvider.otherwise('/login');

        // Force reload on DOM changes
        ngDialogProvider.setForceBodyReload(true);
    })
    .run(function run($rootScope, meshApi) {
        $rootScope._ = window._;
        meshApi.init();
    })
    .config(['$httpProvider', function ($httpProvider) {
        // Reset headers to avoid OPTIONS request (aka pre-flight)
        $httpProvider.defaults.headers.common = {};
        $httpProvider.defaults.headers.post = { 'Content-Type': 'application/json' };
        $httpProvider.defaults.headers.put = { 'Content-Type': 'application/json' };
        $httpProvider.defaults.headers.patch = { 'Content-Type': 'application/json' };
    }])
    .controller('AppCtrl', function AppCtrl($scope, $http, server, $location) {
        $scope.$on('$stateChangeSuccess', function (event, toState, toParams, fromState, fromParams) {
            if (angular.isDefined(toState.data.pageTitle)) {
                $scope.pageTitle = toState.data.pageTitle;
                $scope.loadTags = function ($query) {
                    return $http.get(server.url + '/tags?filter=' + $query);
                };
            }
        });
    });

