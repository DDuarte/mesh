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
        var factory = {
            numberOfPendingNotifications: 0,
            pendingMessagesCount: 0,
            notifications: [],
            limit: 10,
            stopPolling: function(){
                $interval.cancel(refreshNotificationPromise);
                refreshNotificationPromise = undefined;
            },
            refreshNotifications: function() {
                meshApi.getNotifications({limit: factory.limit})
                    .success(function(response) {
                        factory.notifications = response.notifications;
                        factory.numberOfPendingNotifications = response.pendingNotificationsCount;
                        factory.pendingMessagesCount = response.pendingMessagesCount;
                    });
            }
        };

        var refreshRate = 30000;
        factory.refreshNotifications();
        var refreshNotificationPromise = $interval(factory.refreshNotifications, refreshRate);

        return factory;
    })

    .controller('NotificationsCtrl', function NotificationsCtrl ($scope, meshApi, $state, $interval, NotificationsFactory, $rootScope) {

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
            },
            GroupApplicationNotification: function(notification) {
                return { state: 'home.group', params: {name: notification.groupName} };
            }
        };

        var getStateAndParams = function(notification) {
            return notificationTypesStateParams[notification._type](notification);
        };

        /*
        $rootScope.$on('$stateChangeStart',
            function(event, toState, toParams, fromState, fromParams){
                if (fromState.name == 'home.notifications') {
                    $scope.NotificationFactory.limit = 10;
                }
            });
        */

        $scope.NotificationFactory = NotificationsFactory;

        $scope.redirectToNotificationUrl = function(notification) {
            var stateAndParams = getStateAndParams(notification);
            $state.go(stateAndParams.state, stateAndParams.params);
            notification.seen = true;
            meshApi.updateNotification(notification)
                .success(updateNotificationSuccessHandler)
                .error(function(error) {
                    console.log(error);
                });
        };

        $scope.toggleSeenNotification = function(notification) {
            notification.seen = !notification.seen;
            meshApi.updateNotification(notification)
                .success(updateNotificationSuccessHandler)
                .error(function(error) {
                    console.log(error);
                });
        };

        var updateNotificationSuccessHandler = function(response) {
            $scope.NotificationFactory.numberOfPendingNotifications = response.pendingNotificationsCount;
        };

        $scope.replyToInvite = function(reply, notification) {
            notification.seen = true;
            notification.accepted = reply;
            meshApi.replyToGroupInvite(reply, notification).success(function() {

                meshApi.updateNotification(notification)
                    .success(updateNotificationSuccessHandler)
                    .error(function(error) {
                        console.log(error);
                    });

            }).error(function(error) {
                console.log(error);
            });
        };

        $scope.replyToApplication = function(reply, notification) {
            notification.seen = true;
            notification.accepted = reply;
            meshApi.replyToGroupApplication(reply, notification._id, notification.groupName)
                .success(function() {
                    alert("Success");
                })
                .error(function(data) {
                    alert("Error" + JSON.stringify(data));
                });
        };

        $scope.loadMoreNotifications = function(more) {
            NotificationsFactory.limit += more;
            NotificationsFactory.refreshNotifications();
        };
    });