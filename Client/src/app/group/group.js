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

.controller('GroupCtrl', function GroupController($scope, $stateParams, meshApi, ngDialog) {
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

                    $scope.newGroup = { };
                    $scope.newGroup.name = $scope.group.name;
                    $scope.newGroup.description = $scope.group.description;
                    $scope.newGroup.visibility = $scope.group.visibility;
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

        $scope.updateGroup = function () {
            meshApi.updateGroup($scope.group.name, $scope.newGroup.description, $scope.newGroup.visibility)
                .success(function (group) {
                    $scope.group.description = group.description;
                    $scope.group.visibility = group.visibility;
                    $scope.newGroup.description = group.description;
                    $scope.newGroup.visibility = group.visibility;

                    ngDialog.openConfirm({
                        template: 'updateSuccessModelDialogId',
                        className: 'ngdialog-theme-default'
                    }).then(function () {
                        // do nothing
                    });
                })
                .error(function (error) {
                    console.log("error:", error);
                });
            //console.log("update model", $scope.newModel);
            //alert('Save model not yet implemented');
        };
});