angular.module('meshApp.register', [
    'ui.router'
])

    .config(function config($stateProvider) {
        $stateProvider.state('register', {
            url: '/register',
            controller: 'RegisterCtrl',
            templateUrl: 'register/register.tpl.html',
            data: { pageTitle: 'Register' }
        });
    })

    .controller('RegisterCtrl', function LoginController($scope) {
        $scope.init = function () {
            angular.element('body').css("background-color","#428bca");
        };

        $scope.registerInfo = {};

        $scope.registerNewAccount = function() {
            alert("Not yet implemented:\n"+JSON.stringify($scope.registerInfo, null, '\t'));
        };

    })

    .directive('pickADate', function () {
        return {
            restrict: "A",
            scope: {
                pickADate: '=',
                minDate: '=',
                maxDate: '=',
                pickADateOptions: '='
            },
            link: function (scope, element, attrs) {
                var options = $.extend(scope.pickADateOptions || {}, {
                    onSet: function (e) {
                        if (scope.$$phase || scope.$root.$$phase) {// we are coming from $watch or link setup
                            return;
                        }
                        var select = element.pickadate('picker').get('select'); // selected date
                        scope.$apply(function () {
                            if (e.hasOwnProperty('clear')) {
                                scope.pickADate = null;
                                return;
                            }
                            if (!scope.pickADate) {
                                scope.pickADate = new Date(0);
                            }
                            scope.pickADate.setYear(select.obj.getFullYear());
                            // Interesting: getYear returns only since 1900. Use getFullYear instead.
                            // It took me half a day to figure that our. Ironically setYear()
                            // (not setFullYear, duh) accepts the actual year A.D.
                            // So as I got the $#%^ 114 and set it, guess what, I was transported to ancient Rome 114 A.D.
                            // That's it I'm done being a programmer, I'd rather go serve Emperor Trajan as a sex slave.
                            scope.pickADate.setMonth(select.obj.getMonth());
                            scope.pickADate.setDate(select.obj.getDate());
                        });
                    },
                    onClose: function () {
                        element.blur();
                    }
                });
                element.pickadate(options);
                function updateValue(newValue) {
                    if (newValue) {
                        scope.pickADate = (newValue instanceof Date) ? newValue : new Date(newValue);
                        // needs to be in milliseconds
                        element.pickadate('picker').set('select', scope.pickADate.getTime());
                    } else {
                        element.pickadate('picker').clear();
                        scope.pickADate = null;
                    }
                }
                updateValue(scope.pickADate);
                element.pickadate('picker').set('min', scope.minDate ? scope.minDate : false);
                element.pickadate('picker').set('max', scope.maxDate ? scope.maxDate : false);
                scope.$watch('pickADate', function (newValue, oldValue) {
                    if (newValue == oldValue) {
                        return;
                    }
                    updateValue(newValue);
                }, true);
                scope.$watch('minDate', function (newValue, oldValue) {
                    element.pickadate('picker').set('min', newValue ? newValue : false);
                }, true);
                scope.$watch('maxDate', function (newValue, oldValue) {
                    element.pickadate('picker').set('max', newValue ? newValue : false);
                }, true);
            }
        };
    });

