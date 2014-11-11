angular.module('meshApp').factory('meshApi', function ($http, server, $cookieStore) {
    var api = {
        init: function (token) {
            $cookieStore.put('token', token);
        },
        logout: function () {
            $cookieStore.remove('token');
        },
        isLoggedIn: function () {
            return !!getLoggedToken();
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
        return $cookieStore.get('token');
    };

    var getHeaders = function() {
            return api.isLoggedIn() ? {'Authorization': 'Bearer ' + getLoggedToken()} : {};
    };

    return api;
});