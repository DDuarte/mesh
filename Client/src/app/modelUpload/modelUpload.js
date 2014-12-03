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

    .directive('dropZone', function() {
        return function (scope, element, attrs) {
            // Configure the dropzone parameters: don't upload automatically, allow multiple uploads,
            // 100 maximum parallel uploads and files, 20mb maximum file size
            // More parameters on: http://www.dropzonejs.com/
            element.dropzone({
                url: "http://www.torrentplease.com/dropzone.php",
                autoProcessQueue: true,
                uploadMultiple: false,
                parallelUploads: 100,
                maxFiles: 100,
                maxFileSize: 20,
                paramName: "modelFile",
                maxThumbnailFilesize: 5,
                addRemoveLinks: true,
                acceptedFiles: '.pdf,.jpg,.png',
                init: function() {
                    // Test purposes
                    this.on("addedfile", function(file) { alert("Added file."); });
                }
            });

        };
    })

    .controller('ModelUploadCtrl', function ModelUploadController($scope, meshApi) {
        $scope.model = {};
        $scope.modelData = {};
        $scope.init = function() {
            Dropzone.autoDiscover = false;
            var hiddenInput = angular.element('.dz-hidden-input').remove();
        };

        $scope.upload = function() {
            meshApi.uploadModel($scope.model.name, $scope.model.description, $scope.modelData)
                .progress(function(evt) {
                    console.log('progress: ' + parseInt(10, 100.0 * evt.loaded / evt.total) + 'file :'+ evt.config.file.name);
                })
                .success(function(data, status, headers, config) {
                    // file is uploaded successfully
                    console.log('file ' + config.file.name + 'is uploaded successfully. Response: ' + data);
                });
        };
    });
