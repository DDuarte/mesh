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

    .factory('NotificationsSharedVariables', function NotificationsSharedVariables () {
        return {
            numberOfPendingNotifications: 0
        };
    })

    .controller('NotificationsCtrl', function NotificationsCtrl ($scope, meshApi, $state, $interval, NotificationsSharedVariables) {

        $scope.moment = moment;

        var notificationTypesStateParams = {
            UploadNotification:  function(notification) {
                return { state: 'home.model', params: {id: notification.modelId} };
            },
            NewFollowerNotification: function(notification) {
                return { state: 'home.profile', params: {username: notification.follower} };
            },
            NewGroupPublication: function(notification) {
                return { state: 'home.model', params: {id: notification.publishedModelId} };
            }
        };

        var getStateAndParams = function(notification) {
            return notificationTypesStateParams[notification._type](notification);
        };

        $scope.redirectToNotificationUrl = function(notification) {
            var stateAndParams = getStateAndParams(notification);
            $state.go(stateAndParams.state, stateAndParams.params);
            notification.seen = true;
            meshApi.updateNotification(notification).success(function() {
                updatePendingNotifications();
            }).error(function(error) {
                console.log(error);
                // TODO notify error
            });
        };

        var refreshNotifications = function() {
            meshApi.getNotifications({limit: 5})
                .success(function(notifications) {
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

        $scope.notifications = [];
        $scope.notificationsSharedVariables = NotificationsSharedVariables;

        $scope.$watch('notifications', function(newNotifications, oldNotifications) {
            if (newNotifications !== oldNotifications && newNotifications != null) {
                updatePendingNotifications();
            }
        });

        var updatePendingNotifications = function() {
            $scope.notificationsSharedVariables.numberOfPendingNotifications =
                _.reduce($scope.notifications, function(acc, notification) {
                    if (!notification.seen) {
                        acc += 1;
                    }
                    return acc;
                }, 0);
        };
    });