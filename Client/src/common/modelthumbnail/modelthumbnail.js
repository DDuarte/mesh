angular.module('ui.mesh.modelthumbnail', [])

    .directive('modelthumbnail', function () {
        return {
            replace: true,
            restrict: 'E',
            scope: {
                modelUrl: '@',
                imageUrl: '@',
                title: '@',
                author: '@',
                authorUrl: '@',
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