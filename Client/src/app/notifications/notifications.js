angular.module('meshApp.notifications', [
    'ui.router'
])
    .config(function config($stateProvider) {
        $stateProvider.state('home.notifications', {
            url: '/notifications',
            controller: 'NotificationsCtrl',
            templateUrl: 'notifications/notifications.tpl.html',
            data: { pageTitle: 'Notifications | Mesh' }
        });
    })

    .factory('NotificationsFactory', function NotificationsSharedVariables ($interval, meshApi) {
        var data = {
            numberOfPendingNotifications: 0,
            notifications: [],
            limit: 10,
            stopPolling: function(){
                $interval.cancel(refreshNotificationPromise);
                refreshNotificationPromise = undefined;
            }
        };

        data.updatePendingNotifications = function() {
            data.numberOfPendingNotifications = _.reduce(data.notifications, function(acc, notification) {
                if (!notification.seen) {
                    acc += 1;
                }
                return acc;
            }, 0);
        };

        var refreshNotifications = function() {
            meshApi.getNotifications({limit: data.limit})
                .success(function(newNotifications) {
                    data.notifications = newNotifications;
                    data.updatePendingNotifications();
                });
        };

        var refreshRate = 30000;
        refreshNotifications();
        var refreshNotificationPromise = $interval(refreshNotifications, refreshRate);

        return data;
    })

    .controller('NotificationsCtrl', function NotificationsCtrl ($scope, meshApi, $state, $interval, NotificationsFactory) {

        $scope.moment = moment;

        var notificationTypesStateParams = {
            UploadNotification:  function(notification) {
                return { state: 'home.model', params: {id: notification.modelId} };
            },
            NewFollowerNotification: function(notification) {
                return { state: 'home.profile', params: {username: notification.follower} };
            },
            NewGroupPublicationNotification: function(notification) {
                return { state: 'home.model', params: {id: notification.publishedModelId} };
            },
            GroupInviteNotification: function(notification) {
                return { state: 'home.group', params: {name: notification.groupName} };
            }
        };

        var getStateAndParams = function(notification) {
            return notificationTypesStateParams[notification._type](notification);
        };

        $scope.NotificationFactory = NotificationsFactory;

        $scope.redirectToNotificationUrl = function(notification) {
            var stateAndParams = getStateAndParams(notification);
            $state.go(stateAndParams.state, stateAndParams.params);
            notification.seen = true;
            meshApi.updateNotification(notification).success(function() {
                $scope.NotificationFactory.updatePendingNotifications();
            }).error(function(error) {
                console.log(error);
            });
        };

        $scope.toggleSeenNotification = function(notification) {
            notification.seen = !notification.seen;
            meshApi.updateNotification(notification).success(function() {
                $scope.NotificationFactory.updatePendingNotifications();
            }).error(function(error) {
                console.log(error);
            });
        };

        $scope.replyToInvite = function(reply, notification) {
            notification.seen = true;
            notification.accepted = reply;
            meshApi.replyToGroupInvite(reply, notification).success(function() {

                meshApi.updateNotification(notification).success(function() {
                    $scope.NotificationFactory.updatePendingNotifications();
                }).error(function(error) {
                    console.log(error);
                });

            }).error(function(error) {
                console.log(error);
            });
        };
    });