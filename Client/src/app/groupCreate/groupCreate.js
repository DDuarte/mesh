angular.module('meshApp.groupCreate', [
    'ui.router'
])
    .config(function ($stateProvider) {
        $stateProvider.state('home.groupCreate', {
            url: '/groupCreate/',
            templateUrl: 'groupCreate/groupCreate.tpl.html',
            data: {
                pageTitle: "Create Group"
            }
        });
    })
    .controller("GroupCreateCtrl", function ($scope, $state, meshApi) {
        $scope.createGroup = function (groupName) {
            meshApi.createGroup(groupName)
                .success(function () {

                })
                .error(function (data, status, headers, config) {

                });
        };
    });
