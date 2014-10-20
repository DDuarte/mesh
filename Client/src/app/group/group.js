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

        $scope.orderByField = 'index';
        $scope.reverseSort = false;

        $scope.groupMembers = [
            {
                "index": 0,
                "username": "consecteturquis46",
                "name": "Kelley Fox",
                "joinDate": 1396666035868,
                "role": "Member"
            },
            {
                "index": 1,
                "username": "aliquapariatur69",
                "name": "Lorena Juarez",
                "joinDate": 1411038748154,
                "role": "Member"
            },
            {
                "index": 2,
                "username": "deseruntdeserunt27",
                "name": "Berger Albert",
                "joinDate": 1398239665180,
                "role": "Administrator"
            },
            {
                "index": 3,
                "username": "ipsumin51",
                "name": "Maude Lott",
                "joinDate": 1399148282005,
                "role": "Administrator"
            },
            {
                "index": 4,
                "username": "exincididunt89",
                "name": "Felecia Page",
                "joinDate": 1402557414493,
                "role": "Member"
            },
            {
                "index": 5,
                "username": "etveniam8",
                "name": "Noelle Owens",
                "joinDate": 1413749217116,
                "role": "Administrator"
            },
            {
                "index": 6,
                "username": "aliquaipsum25",
                "name": "Norma Mccullough",
                "joinDate": 1389809673616,
                "role": "Administrator"
            },
            {
                "index": 7,
                "username": "doloremollit38",
                "name": "Monica Sherman",
                "joinDate": 1395056121693,
                "role": "Administrator"
            },
            {
                "index": 8,
                "username": "minimminim67",
                "name": "Quinn Warren",
                "joinDate": 1396910663986,
                "role": "Administrator"
            },
            {
                "index": 9,
                "username": "quialiqua63",
                "name": "Priscilla Sullivan",
                "joinDate": 1390939784058,
                "role": "Administrator"
            }
        ];
});