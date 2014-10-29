angular.module('meshApp').factory('meshApi', function ($http) {
    return {
        init: function (token) {
            $http.defaults.headers.Authorization = 'Bearer ' + token;
        }
    };
});