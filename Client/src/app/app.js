angular.module( 'meshApp', [
  'templates-app',
  'templates-common',
  'meshApp.login',
  'meshApp.register',
  'meshApp.model',
  'meshApp.home',
  'meshApp.profile',
  'ui.router',
  'ui.bootstrap'
])

.config( function myAppConfig ( $stateProvider, $urlRouterProvider ) {
  $urlRouterProvider.otherwise( '/login' );
})

.run( function run () {
})

.controller( 'AppCtrl', function AppCtrl ( $scope, $location ) {
  $scope.$on('$stateChangeSuccess', function(event, toState, toParams, fromState, fromParams){
    if ( angular.isDefined( toState.data.pageTitle ) ) {
      $scope.pageTitle = toState.data.pageTitle;
    }
  });
})
;

