angular.module('meshApp.group', [
    'ui.router',
    'ui.mesh.breadcrum'
])

.config(function config($stateProvider) {
    $stateProvider.state('home.group', {
        url: '/group',
        controller: 'GroupCtrl',
        templateUrl: 'group/group.tpl.html',
        data: { pageTitle: 'Group | Mesh' }
    });
})

.controller('GroupCtrl', function GroupController($scope) {
        var models = function (g) { return _.range(10).map(function (i) { return { name: "Model " + g + "-" + i }; }); };
        $scope.galleries = _.range(10).map(function (i) { return { name: "Gallery " + i, models: models(i) }; });

        $scope.orderByField = 'username';
        $scope.reverseSort = false;

        $scope.groupMembers = [
            {
                "avatarLink": "user1.png",
                "username": "consecteturquis46",
                "name": "Kelley Fox",
                "joinDate": 1396666035868,
                "role": "Member"
            },
            {
                "avatarLink": "user2.png",
                "username": "aliquapariatur69",
                "name": "Lorena Juarez",
                "joinDate": 1411038748154,
                "role": "Member"
            },
            {
                "avatarLink": "user3.png",
                "username": "deseruntdeserunt27",
                "name": "Berger Albert",
                "joinDate": 1398239665180,
                "role": "Administrator"
            },
            {
                "avatarLink": "user4.png",
                "username": "ipsumin51",
                "name": "Maude Lott",
                "joinDate": 1399148282005,
                "role": "Administrator"
            },
            {
                "avatarLink": "user5.png",
                "username": "exincididunt89",
                "name": "Felecia Page",
                "joinDate": 1402557414493,
                "role": "Member"
            },
            {
                "avatarLink": "user4.png",
                "username": "etveniam8",
                "name": "Noelle Owens",
                "joinDate": 1413749217116,
                "role": "Administrator"
            }
        ];
});