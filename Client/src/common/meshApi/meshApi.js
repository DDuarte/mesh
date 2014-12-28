angular.module('meshApp').factory('meshApi', function ($http, server, ipCookie, $upload) {
    var api = {
        init: function (data) {
            ipCookie('token', data);
        },
        logout: function () {
            return $http.post(server.url + '/logout', {}, {headers: getHeaders()}).success(function () {
                ipCookie.remove('token');
            });
        },
        validateAccount: function (username, activationToken) {
            return $http.post(server.url + '/activateToken', {username: username, token: activationToken});
        },
        forgotPassword: function (email) {
            return $http.post(server.url + '/forgotPassword', {email: email});
        },
        changePassword: function (email, tokenUser, password) {
            return $http.post(server.url + '/changePassword', {
                email: email,
                token: tokenUser.split('-')[0],
                password: password
            });
        },
        isLoggedIn: function () {
            return !!getLoggedToken().token;
        },
        getLoggedUsername: function () {
            return getLoggedToken().username;
        },
        getLoggedAvatar: function () {
            return getLoggedToken().avatar;
        },
        getModelsOlderThan: function (date) {
            return $http.get(server.url + '/catalog/newest', {
                params: {startDate: date},
                headers: getHeaders()
            });
        },
        getTopRatedModelIds: function () {
            return $http.get(server.url + '/catalog/topRated', {
                headers: getHeaders()
            });
        },
        getModel: function (id) {
            return $http.get(server.url + '/models/' + id, {headers: getHeaders()});
        },
        addModelVote: function (modelId, vote) {
            return $http.post(server.url + '/models/' + modelId + '/votes', {vote: vote}, {headers: getHeaders()});
        },
        deleteModelVote: function (modelId) {
            return $http({
                url: server.url + '/models/' + modelId + '/votes',
                method: 'DELETE',
                headers: {'Authorization': 'Bearer ' + getLoggedToken().token, 'Content-Type': 'application/json'}
            });
        },
        updateModel: function (modelId, description, isPublic, tags) {
            return $http.patch(server.url + '/models/' + modelId, {
                    description: description,
                    isPublic: isPublic,
                    tags: tags
                },
                {headers: getHeaders()});
        },
        deleteModel: function (modelId) {
            return $http({
                url: server.url + '/models/' + modelId,
                method: 'DELETE',
                headers: {'Authorization': 'Bearer ' + getLoggedToken().token, 'Content-Type': 'application/json'}
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
                headers: {'Authorization': 'Bearer ' + getLoggedToken().token, 'Content-Type': 'application/json'}
            });
        },
        addModelToFavourites: function (modelId) {
            return $http.post(server.url + '/users/' + getLoggedToken().username + '/favourites', {modelid: modelId}, {
                headers: getHeaders()
            });
        },
        removeModelFromFavourites: function (modelId) {
            return $http({
                url: server.url + '/users/' + getLoggedToken().username + '/favourites',
                method: 'DELETE',
                data: {modelid: modelId},
                headers: {'Authorization': 'Bearer ' + getLoggedToken().token, 'Content-Type': 'application/json'}
            });
        },
        getFollowers: function (username) {
            return $http.get(server.url + '/users/' + username + '/followers');
        },
        getFollowing: function (username) {
            return $http.get(server.url + '/users/' + username + '/following');
        },
        getAllModels: function (username) {
            return $http.get(server.url + '/users/' + username + '/models');
        },
        followUser: function (otheruser) {
            return $http.post(server.url + '/users/' + getLoggedToken().username + '/followers', {otheruser: otheruser}, {
                headers: getHeaders()
            });
        },
        unfollowUser: function (otheruser) {
            return $http({
                url: server.url + '/users/' + getLoggedToken().username + '/followers',
                method: 'DELETE',
                data: {otheruser: otheruser},
                headers: {'Authorization': 'Bearer ' + getLoggedToken().token, 'Content-Type': 'application/json'}
            });
        },
        createGallery: function (galleryName) {
            return $http.post(server.url + '/users/' + getLoggedToken().username + '/galleries', {galleryName: galleryName}, {
                headers: getHeaders()
            });
        },
        updateGallery: function (galleryName, isPublic) {
            return $http.patch(server.url + '/users/' + getLoggedToken().username + '/galleries/' + galleryName, {isPublic: isPublic}, {
                headers: getHeaders()
            });
        },
        deleteGallery: function (galleryName) {
            return $http['delete'](server.url + '/users/' + getLoggedToken().username + '/galleries/' + galleryName, {
                headers: getHeaders()
            });
        },
        getAllGalleries: function (username) {
            return $http.get(server.url + '/users/' + username + '/galleries', {headers: getHeaders()});
        },
        getModelsFromGallery: function (username, galleryName) {
            return $http.get(server.url + '/users/' + username + '/galleries/' + galleryName, {headers: getHeaders()});
        },
        getGroup: function (id) {
            return $http.get(server.url + '/groups/' + id, {headers: getHeaders()});
        },
        createGroup: function (groupName, groupDescription) {
            return $http.post(server.url + '/groups', {name: groupName, description: groupDescription}, {
                headers: getHeaders()
            });
        },
        uploadModel: function (modelName, modelDescription, tags, file) {
            return $upload.upload({
                url: server.url + '/upload', // upload.php script, node.js route, or servlet url
                method: 'POST',
                headers: {'Authorization': 'Bearer ' + getLoggedToken().token}, // only for html5
                data: {name: modelName, description: modelDescription, tags: tags},
                file: file // single file or a list of files. list is only for html5
            });
        },
        updateUser: function (user) {
            return $http({
                url: server.url + '/users/' + getLoggedToken().username,
                method: 'PATCH',
                data: user,
                headers: {'Authorization': 'Bearer ' + getLoggedToken().token, 'Content-Type': 'application/json'}
            });
        },
        getMainFileUrl: function (modelId) {
            return server.url + '/models/' + modelId + '/files';
        },
        getDownloadModelUrl: function (modelId) {
            return server.url + '/models/' + modelId + '/download';
        },
        search: function (term) {
            return $http.get(server.url + '/search/' + term, {headers: getHeaders()});
        }
    };

    var getLoggedToken = function () {
        if (ipCookie('token')) {
            return ipCookie('token');
        } else {
            return {token: null};
        }
    };

    var getHeaders = function () {
        return api.isLoggedIn() ? {'Authorization': 'Bearer ' + getLoggedToken().token} : {};
    };

    return api;
});
