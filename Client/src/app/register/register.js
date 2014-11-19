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

    .controller('RegisterCtrl', function RegisterController($scope, meshApi, ngDialog) {
        $scope.init = function () {
            angular.element('body').css("background-color","#428bca");
        };

        $scope.curDate = new Date();
        $scope.tempDate = '';

        $scope.registerInfo = {};
        $scope.registerNewAccount = function() {
            $scope.registerInfo.birthdate = $scope.tempDate.toISOString().slice(0,10);

            var success = function (/*data*/) {
                ngDialog.open({
                    template: 'followupRegister',
                    className: 'ngdialog-theme-default',
                    scope: $scope
                });
            };

            var error = function (err) {
                $scope.registerError = err.message;
            };

            meshApi.register($scope.registerInfo).success(success).error(error);
        };

        $scope.isOpen = false;
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
            link: function (scope, element/*, attrs*/) {
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
    })

    .directive('countrySelect', ['$parse', function ($parse) {
        var countries = [
            "Afghanistan", "Aland Islands", "Albania", "Algeria", "American Samoa", "Andorra", "Angola",
            "Anguilla", "Antarctica", "Antigua And Barbuda", "Argentina", "Armenia", "Aruba", "Australia", "Austria",
            "Azerbaijan", "Bahamas", "Bahrain", "Bangladesh", "Barbados", "Belarus", "Belgium", "Belize", "Benin",
            "Bermuda", "Bhutan", "Bolivia, Plurinational State of", "Bonaire, Sint Eustatius and Saba", "Bosnia and Herzegovina",
            "Botswana", "Bouvet Island", "Brazil",
            "British Indian Ocean Territory", "Brunei Darussalam", "Bulgaria", "Burkina Faso", "Burundi", "Cambodia",
            "Cameroon", "Canada", "Cape Verde", "Cayman Islands", "Central African Republic", "Chad", "Chile", "China",
            "Christmas Island", "Cocos (Keeling) Islands", "Colombia", "Comoros", "Congo",
            "Congo, the Democratic Republic of the", "Cook Islands", "Costa Rica", "Cote d'Ivoire", "Croatia", "Cuba",
            "Cyprus", "Czech Republic", "Denmark", "Djibouti", "Dominica", "Dominican Republic", "Ecuador", "Egypt",
            "El Salvador", "Equatorial Guinea", "Eritrea", "Estonia", "Ethiopia", "Falkland Islands (Malvinas)",
            "Faroe Islands", "Fiji", "Finland", "France", "French Guiana", "French Polynesia",
            "French Southern Territories", "Gabon", "Gambia", "Georgia", "Germany", "Ghana", "Gibraltar", "Greece",
            "Greenland", "Grenada", "Guadeloupe", "Guam", "Guatemala", "Guernsey", "Guinea",
            "Guinea-Bissau", "Guyana", "Haiti", "Heard Island and McDonald Islands", "Holy See (Vatican City State)",
            "Honduras", "Hong Kong", "Hungary", "Iceland", "India", "Indonesia", "Iran, Islamic Republic of", "Iraq",
            "Ireland", "Isle of Man", "Israel", "Italy", "Jamaica", "Japan", "Jersey", "Jordan", "Kazakhstan", "Kenya",
            "Kiribati", "Korea, Democratic People's Republic of", "Korea, Republic of", "Kuwait", "Kyrgyzstan",
            "Lao People's Democratic Republic", "Latvia", "Lebanon", "Lesotho", "Liberia", "Libya",
            "Liechtenstein", "Lithuania", "Luxembourg", "Macao", "Macedonia, The Former Yugoslav Republic Of",
            "Madagascar", "Malawi", "Malaysia", "Maldives", "Mali", "Malta", "Marshall Islands", "Martinique",
            "Mauritania", "Mauritius", "Mayotte", "Mexico", "Micronesia, Federated States of", "Moldova, Republic of",
            "Monaco", "Mongolia", "Montenegro", "Montserrat", "Morocco", "Mozambique", "Myanmar", "Namibia", "Nauru",
            "Nepal", "Netherlands", "New Caledonia", "New Zealand", "Nicaragua", "Niger",
            "Nigeria", "Niue", "Norfolk Island", "Northern Mariana Islands", "Norway", "Oman", "Pakistan", "Palau",
            "Palestinian Territory, Occupied", "Panama", "Papua New Guinea", "Paraguay", "Peru", "Philippines",
            "Pitcairn", "Poland", "Portugal", "Puerto Rico", "Qatar", "Reunion", "Romania", "Russian Federation",
            "Rwanda", "Saint Barthelemy", "Saint Helena, Ascension and Tristan da Cunha", "Saint Kitts and Nevis", "Saint Lucia",
            "Saint Martin (French Part)", "Saint Pierre and Miquelon", "Saint Vincent and the Grenadines", "Samoa", "San Marino",
            "Sao Tome and Principe", "Saudi Arabia", "Senegal", "Serbia", "Seychelles", "Sierra Leone", "Singapore",
            "Sint Maarten (Dutch Part)", "Slovakia", "Slovenia", "Solomon Islands", "Somalia", "South Africa",
            "South Georgia and the South Sandwich Islands", "South Sudan", "Spain", "Sri Lanka", "Sudan", "Suriname",
            "Svalbard and Jan Mayen", "Swaziland", "Sweden", "Switzerland", "Syrian Arab Republic",
            "Taiwan, Province of China", "Tajikistan", "Tanzania, United Republic of", "Thailand", "Timor-Leste",
            "Togo", "Tokelau", "Tonga", "Trinidad and Tobago", "Tunisia", "Turkey", "Turkmenistan",
            "Turks and Caicos Islands", "Tuvalu", "Uganda", "Ukraine", "United Arab Emirates", "United Kingdom",
            "United States", "United States Minor Outlying Islands", "Uruguay", "Uzbekistan", "Vanuatu",
            "Venezuela, Bolivarian Republic of", "Viet Nam", "Virgin Islands, British", "Virgin Islands, U.S.",
            "Wallis and Futuna", "Western Sahara", "Yemen", "Zambia", "Zimbabwe"
        ];

        return {
            restrict: 'E',
            template: '<select><option value="" disabled selected>Select Your Country</option><option>' + countries.join('</option><option>') + '</option></select>',
            replace: true,
            link: function (scope, elem, attrs) {
                if (attrs.ngModel) {
                    scope.$watch(attrs.ngModel, function (country) {
                        elem.val(country);
                    });
                }
            }
        };
    }]);

