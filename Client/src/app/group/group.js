angular.module('meshApp.group', [
    'ui.router',
    'ui.mesh.breadcrum'
])

.config(function config($stateProvider) {
    $stateProvider.state('home.group', {
        url: '/group/:name',
        controller: 'GroupCtrl',
        templateUrl: 'group/group.tpl.html',
        data: { pageTitle: 'Group | Mesh' }
    });
})

.controller('GroupCtrl', function GroupController($scope, $stateParams, meshApi) {
        $scope.isLoggedIn = meshApi.isLoggedIn();
        if ($scope.isLoggedIn) {
            $scope.loggedUsername = meshApi.getLoggedUsername();
            $scope.loggedAvatar = meshApi.getLoggedAvatar();
        }

        $scope.loadMembers = function() {
            meshApi.getGroupMembers($stateParams.name).
                success(function (data, status, headers, config) {
                    for (var i = 0; i < data.length; ++i) {
                        if (data[i].role === 'IS_ADMIN') {
                            data[i].role = "Administrator";
                        }
                        else {
                            data[i].role = "Member";
                        }
                    }
                    $scope.group.groupMembers = data;
                }).
                error(function (err) {
                    alert("The group members could not be retrieved: " + err.message); //TODO prettify error display
                });
        };

        $scope.init = function() {
            $scope.group = {};
            meshApi.getGroup($stateParams.name).
                success(function (data, status, headers, config) {
                    $scope.group = data.group;
                    $scope.loadMembers(); //TODO remove this when group template is altered so that the member list isn't loaded right away
                }).
                error(function (err) {
                    alert("The group could not be retrieved: " + err.message); //TODO redirect to error page
                });

        };



        $scope.applied = false;
        $scope.applyToGroup = function() {
            meshApi.applyToGroup($scope.group.name)
                .success(function() {
                    $scope.applied = true;
                    alert("Success");
                })
                .error(function(data) {
                    alert("Error" + JSON.stringify(data));
                });
        };

        var models = function (g) { return _.range(10).map(function (i) { return { name: "Model " + g + "-" + i }; }); };
        $scope.galleries = _.range(10).map(function (i) { return { name: "Gallery " + i, models: models(i) }; });

        $scope.orderByField = 'username';
        $scope.reverseSort = false;

        $scope.selectedGallery = $scope.galleries[0];

        $scope.galleriesPaginatorMaxSize = 5;
        $scope.galleriesPaginatorCurrentPage = 1;
        $scope.galleriesPaginatorItemsPerPage = 6;
        $scope.galleriesPaginatorTotalItems = $scope.selectedGallery.models.length;

        $scope.galleriesPaginatorSetPage = function (pageNo) {
            $scope.galleriesPaginatorCurrentPage = pageNo;
        };

        $scope.changeSelectedGallery = function (index) {
            $scope.selectedGallery = $scope.galleries[index];
            $scope.galleriesPaginatorCurrentPage = 1;
        };


         $scope.getModels = function() {
             meshApi.getGroupModels($scope.group.name)
                .success(function(data) {
                     console.log(data);
                    $scope.models = data;
                });
         };

        /*
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
        */
});