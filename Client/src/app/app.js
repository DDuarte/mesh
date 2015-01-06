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
    'meshApp.notifications',
    'meshApp.groupCreate',
    'meshApp.createMessage',
    'meshApp.notFound',
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
    'angularFileUpload',
    'toastr'
])

    .constant('_', window._)
    .constant('angularMomentConfig', {
        preprocess: 'utc'/*,
         timezone: 'Europe/London'*/
    }
)
    .config(function myAppConfig($stateProvider, $urlRouterProvider, ngDialogProvider, $httpProvider) {
        $httpProvider.interceptors.push('httpInterceptor');
        $urlRouterProvider.otherwise('/catalog');

        // Force reload on DOM changes
        ngDialogProvider.setForceBodyReload(true);
    })
    .run(function run($rootScope, meshApi) {
        $rootScope._ = window._;
        meshApi.init();
        THREE.Loader.Handlers.add(/.*\.dds$/, new THREE.DDSLoader());
        THREE.Loader.Handlers.add(/.*\.tga$/, new THREE.TGALoader());
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

