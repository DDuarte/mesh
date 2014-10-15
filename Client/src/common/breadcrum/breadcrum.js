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
                console.log($attrs);
                $scope.paths = $attrs.path.split('/');
                console.log($scope.paths);
            },
            link: function ($scope, $element, $attrs) {
                // console.log("Breadcrum Link");
                // $scope.paths = $attrs.path.split('/');
            }
        };
    })
;