angular.module('meshApp.createMessage', [
    'ui.router'
])
    .config(function config($stateProvider) {
        $stateProvider.state('home.createMessage', {
            url: '/createMessage/:toUsername',
            controller: 'CreateMessageCtrl',
            templateUrl: 'messageCreate/messageCreate.tpl.html',
            data: {pageTitle: 'Create Message | Mesh'}
        });
    })

    .controller('CreateMessageCtrl', function MessagesCtrl($scope, $stateParams, meshApi, toaster, $state) {
        $scope.message = {
            to: "",
            title: "",
            content: ""
        };

        $scope.message.to = $stateParams.toUsername;

        $scope.sendMessage = function () {
            meshApi.sendMessage($scope.message.to, $scope.message.title, $scope.message.content)
                .success(function () {
                    $state.go('home.messages');
                    toaster.pop('success', "", "Message sent successfuly");
                })
                .error(function (data) {
                    toaster.pop('error', "Error", JSON.stringify(data));
                });
        };
    });