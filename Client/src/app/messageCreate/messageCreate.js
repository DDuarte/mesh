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

    .controller('CreateMessageCtrl', function MessagesCtrl($scope, $stateParams, meshApi, $state, toastr) {
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
                    toastr.success('Message sent successfuly', 'Send Message');
                })
                .error(function (data) {
                    toastr.error(JSON.stringify(data), 'Error');
                });
        };
    });
