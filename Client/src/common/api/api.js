angular.module('meshApp').factory('api', function ($http) {
    return {
        init: function (token) {
            $http.defaults.headers.Authorization = 'Bearer ' + token;
        }
    };
});