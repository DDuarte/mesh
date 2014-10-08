angular.module('headerBar', ['ui.bootstrap'])

    .directive('headerBar', function () {
        return {
            restrict: 'AE',
            templateUrl: 'headerBar/headerBar.tpl.html',
            link: function ($element, $scope) {
                $scope.collapseSidebar = function () {
                    console.log("hello");
                    if (!$('body').hasClass('hidden-left')) {
                        if ($('.headerwrapper').hasClass('collapsed')) {
                            $('.headerwrapper, .mainwrapper').removeClass('collapsed');
                        } else {
                            $('.headerwrapper, .mainwrapper').addClass('collapsed');
                            $('.children').hide(); // hide sub-menu if leave open
                        }
                    } else {
                        if (!$('body').hasClass('show-left')) {
                            $('body').addClass('show-left');
                        } else {
                            $('body').removeClass('show-left');
                        }
                    }
                };
            }
        };
    })
;