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

    .controller('MessagesCtrl', function MessagesCtrl ($scope, meshApi, _, NotificationsFactory, toaster) {

        $scope.moment = moment;

        $scope.NotificationsFactory = NotificationsFactory;

        $scope.limit = 5;

        var selectedTab = '';

        $scope.getReceivedMessages = function() {
            selectedTab = 'received';
            meshApi.getReceivedMessages({limit: $scope.limit})
                .success(function(response) {
                    _.forEach(response.messages, function(message) {
                        message.isCollapsed = true;
                        message.showReplyForm = false;
                    });
                    $scope.messages.inbox = response.messages;
                    NotificationsFactory.pendingMessagesCount = response.pendingMessagesCount;
                });
        };

        $scope.getSentMessages = function() {
            selectedTab = 'sent';
            meshApi.getSentMessages({limit: $scope.limit})
                .success(function(response) {
                    _.forEach(response.messages, function(message) {
                        message.isCollapsed = true;
                    });
                    $scope.messages.sent = response.messages;
                    NotificationsFactory.pendingMessagesCount = response.pendingMessagesCount;
                });
        };

        $scope.getTrashMessages = function() {
            selectedTab = 'trash';
            meshApi.getTrashMessages({limit: $scope.limit})
                .success(function(response) {
                    _.forEach(response.messages, function(message) {
                        message.isCollapsed = true;
                    });
                    $scope.messages.trash = response.messages;
                    NotificationsFactory.pendingMessagesCount = response.pendingMessagesCount;
                });
        };

        $scope.selectMessage = function(message) {
            message.isCollapsed = !message.isCollapsed;
            if (!message.seen && selectedTab == 'received') {
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

        $scope.deleteMessages = function (messages) {
            var selectedMessages =  _.filter(messages, {'selected': true});
            meshApi.deleteMessages(selectedMessages).success(function(response) {
                NotificationsFactory.pendingMessagesCount = response.pendingMessagesCount;
                toaster.pop('success', "", "Messages deleted successfuly");
            });
        };

        $scope.noMessagesSelected = function () {
            return !_.some($scope.messages.inbox, { 'selected': true });
        };

        $scope.messages = {
            inbox: [],
            sent: []
        };

        $scope.activePane = 'inbox';

        $scope.toggleReplying = function(message) {
            message.showReplyForm = !message.showReplyForm;
            message.reply = {
                to: message.userFrom,
                title: 'Re: ' + message.title,
                content: ''
            };
        };

        $scope.sendReply = function (message) {
            meshApi.sendMessage(message.reply.to, message.reply.title, message.reply.content)
                .success(function () {
                    message.showReplyForm = false;
                    toaster.pop('success', "", "Message sent successfuly");
                })
                .error(function (data) {
                    toaster.pop('error', "Error", JSON.stringify(data));
                });
        };

        $scope.loadMoreMessages = function(more) {
            $scope.limit += more;
            if (selectedTab == 'received') {
                $scope.getReceivedMessages();
            } else if (selectedTab == 'sent') {
                $scope.getSentMessages();
            }
        };
    });