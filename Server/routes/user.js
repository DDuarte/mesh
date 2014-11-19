'use strict';

var User = require('../models/user');
var Promise = require('bluebird');
var client = require('../common/redisClient');

var schema = require('../schema');

module.exports = function (server) {

    server.route({
        method: 'GET',
        path: '/users/{id}',
        handler: function (request, reply) {
            var id = request.params.id;

            client.incr(id + '_counter', function (err, counter) {
                reply({
                    'id': id,
                    'counter': counter
                });
            });
        }
    });

    server.route({
        method: 'POST',
        path: '/users/{username}/favourites',
        config: {
            auth: 'token',
            validate: {
                params: {
                    username: schema.user.username.required()
                },
                payload: {
                    modelid: schema.model.id.required()
                }
            }
        },
        handler: function (request, reply) {
            if (request.params.username != request.auth.credentials.username)
                reply('Permission denied').code(403);

            User.addFavouriteModel(request.auth.credentials.username, request.payload.modelid).then(function (result) {
                if (result.length == 0) {
                    reply('No such model.').code(404);
                } else {
                    reply(result);
                }
            }, function (error) {
                reply('Internal error').code(500);
            });
        }
    });

    server.route({
        method: 'DELETE',
        path: '/users/{username}/favourites',
        config: {
            auth: 'token',
            validate: {
                params: {
                    username: schema.user.username.required()
                },
                payload: {
                    modelid: schema.model.id.required()
                }
            }
        },
        handler: function (request, reply) {
            if (request.params.username != request.auth.credentials.username)
                reply('Permission denied').code(403);

            User.removeFavouriteModel(request.auth.credentials.username, request.payload.modelid).then(function (result) {
                if (!result) {
                    reply('No such model.').code(404);
                } else {
                    reply(result);
                }
            }, function (error) {
                reply('Internal error').code(500);
            });
        }
    });

    server.route({
        method: 'POST',
        path: '/users/{username}/followers',
        config: {
            auth: 'token',
            validate: {
                params: {
                    username: schema.user.username.required()
                },
                payload: {
                    otheruser: schema.user.username.required()
                }
            }
        },
        handler: function (request, reply) {
            if (request.params.username != request.auth.credentials.username)
                reply('Permission denied').code(403);
            if (request.params.username == request.payload.otheruser)
                reply('Can\'t follow yourself').code(400);

            User.followUser(request.auth.credentials.username, request.payload.otheruser).then(function (result) {
                if (result.length == 0) {
                    reply('No such user.').code(404);
                } else {
                    reply(result);
                }
            }, function (error) {
                reply('Internal error').code(500);
            });
        }
    });

    server.route({
        method: 'DELETE',
        path: '/users/{username}/followers',
        config: {
            auth: 'token',
            validate: {
                params: {
                    username: schema.user.username.required()
                },
                payload: {
                    otheruser: schema.user.username.required()
                }
            }
        },
        handler: function (request, reply) {
            if (request.params.username != request.auth.credentials.username)
                reply('Permission denied').code(403);

            User.unfollowUser(request.auth.credentials.username, request.payload.otheruser).then(function (result) {
                if (!result) {
                    reply('No such user.').code(404);
                } else {
                    reply(result);
                }
            }, function (error) {
                reply('Internal error').code(500);
            });
        }
    });
};