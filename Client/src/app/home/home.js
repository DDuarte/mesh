/**
 * Each section of the site has its own module. It probably also has
 * submodules, though this boilerplate is too simple to demonstrate it. Within
 * `src/app/home`, however, could exist several additional folders representing
 * additional modules that would then be listed as dependencies of this one.
 * For example, a `note` section could have the submodules `note.create`,
 * `note.delete`, `note.edit`, etc.
 *
 * Regardless, so long as dependencies are managed correctly, the build process
 * will automatically take take of the rest.
 *
 * The dependencies block here is also where component dependencies should be
 * specified, as shown below.
 */
angular.module('meshApp.home', [
    'ui.bootstrap'
])

/**
 * Each section or module of the site can also have its own routes. AngularJS
 * will handle ensuring they are all available at run-time, but splitting it
 * this way makes each module more "self-contained".
 */
    .config(function config($stateProvider) {
        $stateProvider.state('home', {
            templateUrl: 'home/home.tpl.html',
            abstract: true,
            data: { pageTitle: 'Home | Mesh' }
        });
    })

    .controller("HomeCtrl", function ($scope, $state) {
        $scope.collapseSidebar = function () {
            if (!angular.element('body').hasClass('hidden-left')) {
                if (angular.element('.headerwrapper').hasClass('collapsed')) {
                    angular.element('.headerwrapper, .mainwrapper').removeClass('collapsed');
                } else {
                    angular.element('.headerwrapper, .mainwrapper').addClass('collapsed');
                    angular.element('.children').hide(); // hide sub-menu if leave open
                }
            } else {
                if (!angular.element('body').hasClass('show-left')) {
                    angular.element('body').addClass('show-left');
                } else {
                    angular.element('body').removeClass('show-left');
                }
            }

            angular.element(window).trigger('resize');
        };

        $scope.smallWindow = function () { return angular.element(window).width() <= 456; };

        angular.element(window).ready(function () {
            // Tooltip
            angular.element('.tooltips').tooltip({ container: 'body'});

            // Popover
            angular.element('.popovers').popover();

            // Show panel buttons when hovering panel heading
            angular.element('.panel-heading').hover(function () {
                angular.element(this).find('.panel-btns').fadeIn('fast');
            }, function () {
                angular.element(this).find('.panel-btns').fadeOut('fast');
            });
//
            // // Close Panel
            angular.element('.panel .panel-close').click(function () {
                angular.element(this).closest('.panel').fadeOut(200);
                return false;
            });

            // Minimize Panel
            angular.element('.panel .panel-minimize').click(function () {
                var t = angular.element(this);
                var p = t.closest('.panel');
                if (!angular.element(this).hasClass('maximize')) {
                    p.find('.panel-body, .panel-footer').slideUp(200);
                    t.addClass('maximize');
                    t.find('i').removeClass('fa-minus').addClass('fa-plus');
                    angular.element(this).attr('data-original-title', 'Maximize Panel').tooltip();
                } else {
                    p.find('.panel-body, .panel-footer').slideDown(200);
                    t.removeClass('maximize');
                    t.find('i').removeClass('fa-plus').addClass('fa-minus');
                    angular.element(this).attr('data-original-title', 'Minimize Panel').tooltip();
                }
                return false;
            });

            angular.element('.leftpanel .nav .parent > a').click(function () {

                var coll = angular.element(this).parents('.collapsed').length;

                if (!coll) {
                    angular.element('.leftpanel .nav .parent-focus').each(function () {
                        angular.element(this).find('.children').slideUp('fast');
                        angular.element(this).removeClass('parent-focus');
                    });

                    var child = angular.element(this).parent().find('.children');
                    if (!child.is(':visible')) {
                        child.slideDown('fast');
                        if (!child.parent().hasClass('active')) {
                            child.parent().addClass('parent-focus');
                        }
                    } else {
                        child.slideUp('fast');
                        child.parent().removeClass('parent-focus');
                    }
                }
                return false;
            });

            angular.element(window).bind('resize', function () {
                hideMenu();
            });
            // for loading/refreshing the page
            function hideMenu() {

                if (angular.element('.header-right').css('position') == 'relative') {
                    angular.element('body').addClass('hidden-left');
                    angular.element('.headerwrapper, .mainwrapper').removeClass('collapsed');
                } else {
                    angular.element('body').removeClass('hidden-left');
                }

                // Search form move to left
                if ($scope.smallWindow()) {
                    if (angular.element('.leftpanel .form-search').length === 0) {
                        angular.element('.form-search').insertAfter(angular.element('.profile-left'));
                        angular.element('.form-search').css('margin', '10px 10px 10px 10px');
                    }
                } else {
                    if (angular.element('.header-right .form-search').length === 0) {
                        angular.element('.form-search').insertBefore(angular.element('.btn-group-notification'));
                        angular.element('.form-search').css('margin', 'inherit');
                    }
                }
            }
            hideMenu();

            collapsedMenu(); // for loading/refreshing the page
            function collapsedMenu() {

                if (angular.element('.logo').css('position') == 'relative') {
                    angular.element('.headerwrapper, .mainwrapper').addClass('collapsed');
                } else {
                    angular.element('.headerwrapper, .mainwrapper').removeClass('collapsed');
                }
            }
        });

        $scope.submitSearch = function() {
            $state.go('home.search', {q: $scope.query});
        };
    })

;

