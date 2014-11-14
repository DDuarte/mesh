angular.module('meshApp').factory('meshApi', function ($http, server, ipCookie) {
    var api = {
        init: function (data) {
            ipCookie('token', data);
        },
        logout: function () {
            return $http.post(server.url + '/logout', {}, { headers: getHeaders() }).success(function () {
                ipCookie.remove('token');
            });
        },
        isLoggedIn: function () {
            return !!getLoggedToken();
        },
        getLoggedUsername: function () {
            return getLoggedToken().username;
        },
        getLoggedAvatar: function () {
            return getLoggedToken().avatar;
        },
        getModel: function (id) {
            return $http.get(server.url + '/models/' + id, {headers: getHeaders()});
        },
        addModelVote: function (modelId, vote) {
            return $http.post(server.url + '/models/' + modelId + '/votes', {vote: vote},{headers: getHeaders()});
        },
        deleteModelVote: function (modelId) {
            return $http({
                url: server.url + '/models/' + modelId + '/votes',
                method: 'DELETE',
                headers:  {'Authorization': 'Bearer ' + getLoggedToken().token, 'Content-Type': 'application/json' }
            });
        },
        register: function (registerInfo) {
            return $http.post(server.url + '/register', registerInfo);
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
        },
        removeComment: function (modelId, date) {
            return $http({
                url: server.url + '/models/' + modelId + '/comments',
                method: 'DELETE',
                data: {date: date},
                headers:  {'Authorization': 'Bearer ' + getLoggedToken().token, 'Content-Type': 'application/json' }
            });
        }
    };

    var getLoggedToken = function () {
        return ipCookie('token');
    };

    var getHeaders = function() {
        return api.isLoggedIn() ? {'Authorization': 'Bearer ' + getLoggedToken().token} : {};
    };

    return api;
});