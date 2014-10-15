angular.module('meshApp.group', [
    'ui.router',
    'ui.mesh.breadcrum'
])

.config(function config($stateProvider) {
    $stateProvider.state('home.group', {
        url: '/group',
        controller: 'GroupCtrl',
        templateUrl: 'group/group.tpl.html',
        data: { pageTitle: 'group' }
    });
})

.controller('GroupCtrl', function GroupController($scope) {
});