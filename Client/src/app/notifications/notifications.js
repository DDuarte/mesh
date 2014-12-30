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

    .controller('NotificationsCtrl', function NotificationsCtrl ($scope, meshApi, $state, $interval) {

        $scope.moment = moment;

        var notificationTypes = {
            upload: {
                getMessage: function(notification) {
                    return notification.uploader + ' has just uploaded a new model: ' + notification.modelName;
                },
                getImage: function(notification) {
                    return notification.modelThumbnail;
                },
                getStateAndParams: function(notification) {
                    return { state: 'home.model', params: {id: notification.modelId} };
                }
            },
            newFollower: {
                getMessage: function(notification) {
                    return notification.follower + ' is now following you';
                },
                getImage: function(notification) {
                    return notification.followerAvatar;
                },
                getStateAndParams: function(notification) {
                    return { state: 'home.profile', params: {username: notification.follower} };
                }
            },
            newGroupPublication: {
                getMessage: function(notification) {
                    return notification.publisher + ' has published a model in ' + notification.groupName;
                },
                getImage: function(notification) {
                    return notification.publishedModelThumbnail;
                },
                getStateAndParams: function(notification) {
                    return { state: 'home.model', params: {id: notification.publishedModelId} };
                }
            }
        };

        var refreshNotifications = function() {
            meshApi.getNotifications({limit: 5})
                .success(function(notifications) {
                    console.log("Notifications:", notifications);
                   /* _.each(notifications, function(notification) {
                        notification.message = getMessage(notification);
                        notification.image = getImage(notification);
                    });*/
                    $scope.notifications = notifications;
                });
        };

        $scope.refreshNotifications = refreshNotifications;

        var refreshRate = 30000;
        var refreshNotificationPromise = $interval(refreshNotifications, refreshRate);

        // Cancel interval on page changes
        $scope.$on('$destroy', function(){
            if (angular.isDefined(refreshNotificationPromise)) {
                $interval.cancel(refreshNotificationPromise);
                refreshNotificationPromise = undefined;
            }
        });

        $scope.getLatestNotifications = function() {
            meshApi.getNotifications({limit: 5})
                .success(function(notifications) {
                   /* _.each(notifications, function(notification) {
                        notification.message = getMessage(notification);
                        notification.image = getImage(notification);
                    });*/
                    $scope.notifications = notifications;
                });
        };

        $scope.goToNotificationUrl = function(notification) {
            var stateAndParams = getStateAndParams(notification);
            $state.go(stateAndParams.state, stateAndParams.params);
            notification.seen = true;
            updatePendingNotifications();
            meshApi.setNotificationAsSeen(notification);
        };

        $scope.notifications = [];

        $scope.$watch('notifications', function(newNotifications, oldNotifications) {
            if (newNotifications !== oldNotifications && newNotifications != null) {
                updatePendingNotifications();
            }
        });

        var updatePendingNotifications = function() {
            $scope.pendingNotifications = _.filter($scope.notifications, function(notification) {
                return !notification.seen;
            });
        };
    });