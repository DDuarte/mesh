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

    .controller('ModelUploadCtrl', function ModelUploadController($scope, meshApi, ngDialog) {
        $scope.model = {};
        $scope.modelData = {};
        $scope.uploadError = false;
        $scope.uploadProgress = 0;
        $scope.uploadCompleted = false;

        $scope.init = function() {
            Dropzone.autoDiscover = false;
            var hiddenInput = angular.element('.dz-hidden-input').remove();
        };

        $scope.upload = function() {

            ngDialog.openConfirm({
                template: 'uploadProgressId',
                className: 'ngdialog-theme-default',
                scope: $scope
            }).then(function(value) {
                //console.log("CLOSED");
                $scope.uploadProgress = 0;
                $scope.uploadCompleted = false;
                // TODO: change to model view
            });

            meshApi.uploadModel($scope.model.name, $scope.model.description, $scope.modelData)
                .progress(function(evt) {
                    if (evt && evt.loaded && evt.total) {
                        $scope.uploadProgress = 100.0 * (evt.loaded / evt.total);
                    }
                })
                .success(function(data, status, headers, config) {
                    // file is uploaded successfully
                    //console.log('file ' + config.file.name + 'is uploaded successfully. Response: ' + data);
                    $scope.uploadCompleted = true;
                })
                .error(function(data) {
                    $scope.uploadError = true;
                    $scope.uploadErrorMessage = (data && data.message) ? data.message : data;
                    ngDialog.closeAll();
                    $scope.uploadProgress = 0;
                    $scope.uploadCompleted = false;
                });
        };
    });
