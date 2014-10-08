angular.module('sideBar', ['ui.bootstrap'])

    .directive('sideBar', function () {
        return {
            restrict: 'AE',
            templateUrl: 'sideBar/sideBar.tpl.html'
        };
    })
;
