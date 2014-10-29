var placeholderModel = {
    "name": "My horse",
    "files": "http://www.nowhereatall.com",
    "upvotes": 20,
    "downvotes": 2,
    "authorName": "Donatello",
    "authorAvatar": "http://i.imgur.com/KgKyXqN.jpg",
    "authorAbout": "I like pizza and my amazing horse.",
    "publicationDate": "2010-04-05T12:38:20.000Z",
    "description": "Look at my horse, my horse is amazing!",
    "visibility": "public",
    "tags": [
    "horse", "amazing"
    ],
    "comments": [
    {
        "author": "Michelangelo",
        "avatar": "http://i.imgur.com/PbgQGd1.png",
        "date": "2011-10-05T14:45:00.000Z",
        "content": "It tastes just like raisins!"
    },
    {
        "author": "Leonardo",
        "avatar": "http://i.imgur.com/EYi19tc.png",
        "date": "2011-10-05T14:48:00.000Z",
        "content": "That doesn't look like a horse..."
    }
    ]
};

angular.module('meshApp.modelUpload', [
    'ui.router'
    ])
.config(function config($stateProvider) {
    $stateProvider.state('home.modelUpload', {
        url: '/modelUpload/',
        controller: 'ModelUploadCtrl',
        templateUrl: 'modelUpload/modelupload.tpl.html',
        data: { pageTitle: 'Upload model | Mesh' }
    });
})

.controller('ModelUploadCtrl', function ModelUploadController($scope, $stateParams, $http) {

    // Configure the dropzone parameters: don't upload automatically, allow multiple uploads,
    //100 maximum parallel uploads and files, 20mb maximum file size
    $scope.dropzoneConfig = {
      autoProcessQueue: false,
      uploadMultiple: true,
      parallelUploads: 100,
      maxFiles: 100,
      maxFileSize: 20
    };

  // Configure dropzone event handlers
  /*$scope.eventHandlers = {
    successmultiple: function(files, response) { alert("test"); }
  };*/
});
