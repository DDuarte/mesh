angular.module('meshApp').factory('meshApi', function ($http, server, ipCookie) {
    var api = {
        init: function (token, username) {
            ipCookie('token', token);
            ipCookie('loggedUser', username);
        },
        logout: function () {
            return $http.post(server.url + '/logout', {}, { headers: getHeaders() }).success(function () {
                ipCookie.remove('token');
                ipCookie.remove('loggedUser');
            });
        },
        isLoggedIn: function () {
            return !!getLoggedToken();
        },
        getLoggedUsername: function () {
            return ipCookie('loggedUser');
        },
        addComment: function (modelId, comment) {
            return $http.post(server.url + '/models/' + modelId + '/comments', {comment: comment}, {
                headers: getHeaders()
            });
        },
        getComments: function (modelId, date) {
            return $http.get(server.url + '/models/' + modelId + '/comments', {
                params: {startdate: date}
            });
        }
    };

    var getLoggedToken = function () {
        return ipCookie('token');
    };

    var getHeaders = function() {
        console.log(getLoggedToken());
        console.log(api.isLoggedIn());
        return api.isLoggedIn() ? {'Authorization': 'Bearer ' + getLoggedToken()} : {};
    };

    return api;
});