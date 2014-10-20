angular.module('meshApp.messages', [
    'ui.router'
])
    .config(function config($stateProvider) {
        $stateProvider.state('home.messages', {
            url: '/messages',
            controller: 'MessagesCtrl',
            templateUrl: 'messages/messages.tpl.html',
            data: { pageTitle: 'Messages | Mesh' }
        });
    })

    .controller('MessagesCtrl', function MessagesCtrl ($scope) {

        // placeholder for message deletion
        $scope.deleteMessages = function (messages) {
           var selectedMessages =  _.filter(messages, {'selected': true});
        };

        $scope.noMessagesSelected = function () {
            return !_.some($scope.messages.inbox, { 'selected': true });
        };

        // placeholder for the messages
        $scope.messages = {
            inbox: [
                {
                    title: "New model",
                    content: "Lorem Ipsum at adoc",
                    sender: {
                        username: "John Doe"
                    },
                    unread: true
                },
                {
                    title: "Job sample",
                    content: "Lorem Ipsum at adoc",
                    sender: {
                        username: "Jane Doe"
                    },
                    unread: true
                },
                {
                    title: "Job proposal",
                    content: "Lorem Ipsum at adoc",
                    sender: {
                        username: "Mary doe"
                    },
                    unread: true
                },
                {
                    title: "Hello there",
                    content: "Lorem Ipsum at adocs",
                    sender: {
                        username: "Mary doe"
                    },
                    unread: true
                }
            ],
            sent: [

            ]
        };

        $scope.activePane = 'inbox';

    });