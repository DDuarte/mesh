angular.module('meshApp.profile', [
  'ui.router'
])
    .config(function config($stateProvider) {
      $stateProvider.state('home.profile', {
        url: '/profile/:username',
        controller: 'ProfileCtrl',
        templateUrl: 'profile/profile.tpl.html',
        data: { pageTitle: 'Profile | Mesh' }
      });
    })

    .controller('ProfileCtrl', function ProfileController($scope, $stateParams, $http, server, meshApi) {
      $scope.init = function() {
        $http.get(server.url + '/users/' + $stateParams.username). // TODO: make url configurable?
            success(function (data) {
              $scope.user = data;
            });
      };

      $scope.getFollowers = function () {
        meshApi.getFollowers($scope.user.username).success(function (data) {
          $scope.user.followers = data;
        });
      };

      $scope.getFollowing = function () {
        meshApi.getFollowing($scope.user.username).success(function (data) {
          $scope.user.following = data;
        });
      };

      var models = function (g) { return _.range(10).map(function (i) { return { name: "Model " + g + "-" + i }; }); };
      $scope.galleries = _.range(10).map(function (i) { return { name: "Gallery " + i, models: models(i) }; });

      $scope.selectedGallery = $scope.galleries[0];

      $scope.orderByField = 'username';
      $scope.reverseSort = false;

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

      $scope.submit = function() {
        var fields = {
          firstName: true,
          lastName: true,
          about: true
        };

        var updatedUser = _.omit($scope.user, function(value, key) {
          return !fields[key];
        });

        meshApi.updateUser(updatedUser).success(function(data) {
          angular.element('#form-message').remove();
          angular.element('form[name=userInfo]').prepend(
              '<div id="form-message" class="alert alert-success">' +
              '<button type="button" class="close" data-dismiss="alert" aria-hidden="true">×</button>' +
              'Your profile has been updated successfully.' +
              '</div>');
        }).error(function(data) {
          angular.element('#form-message').remove();
          angular.element('form[name=userInfo]').prepend(
              '<div id="form-message" class="alert alert-danger">' +
              '<button type="button" class="close" data-dismiss="alert" aria-hidden="true">×</button>' +
              'Oops, something went wrong. Try again later.' +
              '</div>');
        });
      };
    });