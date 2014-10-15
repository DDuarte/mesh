angular.module('ui.mesh.breadcrum', [])

    .directive('breadcrum', function () {
        return {
            replace: true,
            restrict: 'E',
            templateUrl: 'breadcrum/breadcrum.tpl.html',
            scope: {
                icon: '@',
                title: '@'
            },
            controller: function ($scope, $element, $attrs) {
                $scope.paths = $attrs.path.split('/');
            }
        };
    })
;