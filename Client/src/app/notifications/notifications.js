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

    .controller('NotificationsCtrl', function NotificationsCtrl ($scope) {

        $scope.moment = moment;

        $scope.getLatestNotifications = function() {
            return _.first($scope.notifications, 5);
        };

        // placeholder for the notifications
        $scope.notifications = [
            {
                image: "images/photos/user1.png",
                message: "Nusja Nawancali likes a photo of you",
                url: "#",
                seen: false,
                date: moment().subtract(1, 'minute').toDate()
            },
            {
                image: "images/photos/user2.png",
                message: "Weno Carasbong shared a photo of you in your Mobile",
                url: "#",
                seen: true,
                date: moment().subtract(1, 'hour').toDate()
            },
            {
                image: "images/photos/user3.png",
                message: "Venro Leonga likes a photo of you",
                url: "#",
                seen: true,
                date: moment().subtract(1, 'day').toDate()
            },
            {
                image: "images/photos/user4.png",
                message: "Nanterey Reslaba shared a photo of you in your Mobile",
                url: "#",
                seen: true,
                date: moment().subtract(1, 'month').toDate()
            },
            {
                image: "images/photos/user1.png",
                message: "Nusja Nawancali shared a photo of you in your Mobile",
                url: "#",
                seen: true,
                date: moment().subtract(1, 'year').toDate()
            }
        ];

        $scope.pendingNotifications = _.filter($scope.notifications, function(notification) {
            return !notification.seen;
        });
    });