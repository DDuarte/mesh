angular.module('meshApp').factory('authorization', function ($http, server) {
    var url = server.url;

    return {
        login: function (credentials) {
            console.log(url);
            return $http.post(url + '/login', credentials);
        }
    };
});