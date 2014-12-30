/**
 * @ngdoc directive
 * @name meshApp.modelthumbnail
 *
 * @description
 * Model thumbnail directive
 *
 */
angular.module('ui.mesh.modelthumbnail', [])

    .directive('modelthumbnail', function () {
        return {
            replace: true,
            restrict: 'E',
            scope: {
                modelId: '@',
                imageUrl: '@',
                title: '@',
                author: '@',
                authorAvatar: '@',
                date: '@',
                numComments: '@',
                upvotes: '@',
                downvotes: '@'
            },
            templateUrl: 'modelthumbnail/modelthumbnail.tpl.html'
        };
    })
;