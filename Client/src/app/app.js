angular.module( 'meshApp', [
  'templates-app',
  'templates-common',
  'meshApp.login',
  'meshApp.register',
  'meshApp.model',
  'meshApp.home',
  'meshApp.profile',
  'meshApp.messages',
  'meshApp.group',
  'meshApp.search',
  'meshApp.modelUpload',
  'ui.router',
  'ui.bootstrap',
  'ui.mesh.verticalTabs',
  'ui.mesh.breadcrum',
  'ui.mesh.modelthumbnail',
  'angularMoment',
  'ngTagsInput'
])

.constant('_', window._)
.constant('angularMomentConfig', {
        preprocess: 'utc'/*,
        timezone: 'Europe/London'*/
    }
)
.config( function myAppConfig ( $stateProvider, $urlRouterProvider ) {
  $urlRouterProvider.otherwise( '/login' );
})

.run( function run ($rootScope) {
  $rootScope._ = window._;
})

.controller( 'AppCtrl', function AppCtrl ( $scope, $http, $location ) {
  $scope.$on('$stateChangeSuccess', function(event, toState, toParams, fromState, fromParams){
    if ( angular.isDefined( toState.data.pageTitle ) ) {
      $scope.pageTitle = toState.data.pageTitle;
      $scope.loadTags = function ($query) {
          return $http.get('http://meshdev.ddns.net:8000/tags?filter=' + $query);
      };
    }
  });
})
;

