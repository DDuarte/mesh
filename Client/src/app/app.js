angular.module( 'meshApp', [
  'templates-app',
  'templates-common',
  'meshApp.login',
  'meshApp.register',
  'meshApp.model',
  'meshApp.home',
  'meshApp.profile',
  'meshApp.messages',
  'ui.router',
  'ui.bootstrap',
  'ui.mesh.verticalTabs'
])

.constant('_', window._)
.config( function myAppConfig ( $stateProvider, $urlRouterProvider ) {
  $urlRouterProvider.otherwise( '/login' );
})

.run( function run ($rootScope) {
  $rootScope._ = window._;
})

.controller( 'AppCtrl', function AppCtrl ( $scope, $location ) {
  $scope.$on('$stateChangeSuccess', function(event, toState, toParams, fromState, fromParams){
    if ( angular.isDefined( toState.data.pageTitle ) ) {
      $scope.pageTitle = toState.data.pageTitle;
    }
  });
})
;

