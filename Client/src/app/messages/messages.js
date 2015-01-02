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

    .controller('MessagesCtrl', function MessagesCtrl ($scope, meshApi, _, NotificationsFactory) {

        $scope.moment = moment;

        $scope.NotificationsFactory = NotificationsFactory;

        $scope.getReceivedMessages = function() {
            meshApi.getReceivedMessages()
                .success(function(response) {
                    _.forEach(response.messages, function(message) {
                        message.isCollapsed = true;
                    });
                    $scope.messages.inbox = response.messages;
                    NotificationsFactory.pendingMessagesCount = response.pendingMessagesCount;
                });
        };

        $scope.getSentMessages = function() {
            meshApi.getSentMessages()
                .success(function(response) {
                    _.forEach(response.messages, function(message) {
                        message.isCollapsed = true;
                    });
                    $scope.messages.sent = response.messages;
                    NotificationsFactory.pendingMessagesCount = response.pendingMessagesCount;
                });
        };

        $scope.selectMessage = function(message) {
            message.isCollapsed = !message.isCollapsed;
            if (!message.seen) {
                $scope.toggleSeen(message);
            }
        };

        $scope.toggleSeen = function(message) {
            message.seen = !message.seen;
            meshApi.updateMessage(message)
                .success(function(response) {
                    NotificationsFactory.pendingMessagesCount = response.pendingMessagesCount;
                });
        };

        // placeholder for message deletion
        $scope.deleteMessages = function (messages) {
           var selectedMessages =  _.filter(messages, {'selected': true});
        };

        $scope.noMessagesSelected = function () {
            return !_.some($scope.messages.inbox, { 'selected': true });
        };

        $scope.messages = {
            inbox: [],
            sent: []
        };

        $scope.activePane = 'inbox';

    });