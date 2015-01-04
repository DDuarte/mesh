'use strict';

var User = require('../models/user'),
    Promise = require('bluebird'),
    db = require('../common/db'),
    schema = require('../schema'),
    Boom = require('boom'),
    _ = require('lodash'),
    Joi = require('joi'),
    Message = require('../models/message'),
    Model = require('../models/model');

module.exports = function (server) {

    server.route({
        method: 'POST',
        path: '/messages',
        config: {
            auth: 'token',
            validate: {
                payload: {
                    userTo: schema.message.userTo.required(),
                    content: schema.message.content.required(),
                    title: schema.message.title.required()
                }
            }
        },
        handler: function(request, reply) {
            var userFrom = request.auth.credentials.username;

            Promise.join(User.getByUsername(request.payload.userTo), User.getByUsername(userFrom),
                function(targetUser, sourceUser) {
                    var message = new Message({
                        userTo: request.payload.userTo,
                        userToAvatar: targetUser.avatar,
                        userFrom: userFrom,
                        userFromAvatar: sourceUser.avatar,
                        content: request.payload.content,
                        title: request.payload.title,
                        date: new Date(),
                        seen: false,
                        userToDeleted: false,
                        userFromDeleted: false
                    });

                    message.save(function(err, message) {
                        if (err)
                            return reply(Boom.badImplementation("Internal error: saving message"));

                        return reply(message);
                    });
                })
                .catch(function() {
                    return reply(Boom.badImplementation('Internal server error'));
                });
        }
    });

    server.route({
        method: 'GET',
        path: '/users/{username}/messages/sent',
        config: {
            auth: 'token',
            validate: {
                params: {
                    username: schema.user.username.required()
                },
                query: {
                    limit: Joi.number().greater(0),
                    skip: Joi.number().greater(0)
                }
            }
        },
        handler: function(request, reply) {
            if (request.params.username != request.auth.credentials.username)
                reply('Permission denied').code(403);

            var limit = request.query.limit || 10;
            var skip = request.query.skip || 0;
            var username = request.params.username;
            var query = {userFrom: request.params.username, userFromDeleted: false};

            Message.count({userTo: username, seen: false, userToDeleted: false}, function(err, pendingMessagesCount) {
                if (err)
                    return reply(err).code(500);

                Message.find(query).sort('-date').skip(skip).limit(limit).exec(function(err, messages) {
                    if (err)
                        return reply(err).code(500);
                    return reply({messages: messages, pendingMessagesCount: pendingMessagesCount});
                });
            });
        }
    });

    server.route({
        method: 'GET',
        path: '/users/{username}/messages/received',
        config: {
            auth: 'token',
            validate: {
                params: {
                    username: schema.user.username.required()
                },
                query: {
                    limit: Joi.number().greater(0),
                    skip: Joi.number().greater(0)
                }
            }
        },
        handler: function(request, reply) {
            if (request.params.username != request.auth.credentials.username)
                reply('Permission denied').code(403);

            var limit = request.query.limit || 10;
            var skip = request.query.skip || 0;
            var username = request.params.username;
            var query = {userTo: request.params.username, userToDeleted: false};

            Message.count({userTo: username, seen: false, userToDeleted: false}, function(err, pendingMessagesCount) {
                if (err)
                    return reply(err).code(500);

                Message.find(query).sort('-date').skip(skip).limit(limit).exec(function(err, messages) {
                    if (err)
                        return reply(err).code(500);
                    return reply({messages: messages, pendingMessagesCount: pendingMessagesCount});
                });
            });
        }
    });

    server.route({
        method: 'GET',
        path: '/users/{username}/messages/trash',
        config: {
            auth: 'token',
            validate: {
                params: {
                    username: schema.user.username.required()
                },
                query: {
                    limit: Joi.number().greater(0),
                    skip: Joi.number().greater(0)
                }
            }
        },
        handler: function(request, reply) {
            if (request.params.username != request.auth.credentials.username)
                reply('Permission denied').code(403);

            var limit = request.query.limit || 10;
            var skip = request.query.skip || 0;
            var username = request.params.username;
            var query = {$or: [
                { userFrom: request.params.username, userFromDeleted: true },
                { userTo: request.params.username, userToDeleted: true }
            ]};

            Message.count({userTo: username, seen: false, userToDeleted: false}, function(err, pendingMessagesCount) {
                if (err)
                    return reply(err).code(500);

                Message.find(query).sort('-date').skip(skip).limit(limit).exec(function(err, messages) {
                    if (err)
                        return reply(err).code(500);
                    return reply({messages: messages, pendingMessagesCount: pendingMessagesCount});
                });
            });
        }
    });

    server.route({
        method: 'DELETE',
        path: '/users/{username}/messages',
        config: {
            auth: 'token',
            validate: {
                params: {
                    username: schema.user.username.required()
                },
                query: {
                    _id: Joi.array().includes(Joi.string().min(24).max(24))//.single()
                }
            }
        },
        handler: function(request, reply) {
            if (request.params.username != request.auth.credentials.username)
                reply('Permission denied').code(403);

            var username = request.params.username;
            var query = { _id: {$in: request.query._id}, userTo: username };
            var updatedData = { userToDeleted: true };

            Message.update(query, updatedData, { multi: true }, function(err, numAffected) {
                if(err) {
                    return reply(err).code(500);
                }
                else if(numAffected == 0) {
                    return reply(Boom.badRequest('User does not have those messages')).code(400);
                }
                else {
                    Message.count({userTo: username, seen: false}, function(err, pendingMessagesCount) {
                        if (err)
                            return reply(err).code(500);

                        return reply({message: 'success', pendingMessagesCount: pendingMessagesCount});
                    });
                }
            });
        }
    });

    server.route({
        method: 'PATCH',
        path: '/users/{username}/messages/{_id}',
        config: {
            auth: 'token',
            validate: {
                params: {
                    username: schema.user.username.required(),
                    _id: Joi.string().min(24).max(24).required()
                },
                payload: {
                    seen: schema.message.seen,
                    userToDeleted: Joi.boolean()
                }
            }
        },
        handler: function(request, reply) {
            var username = request.auth.credentials.username;

            var query = {
                userTo: username,
                _id: request.params._id
            };

            var updatedData = {
                seen: request.payload.seen,
                userToDeleted: request.payload.userToDeleted
            };

            Message.update(query, updatedData, { multi: false }, function(err, numAffected) {
                if(err) {
                    return reply(err).code(500);
                }
                else if(numAffected == 0) {
                    return reply(Boom.badRequest('User does not have that message')).code(400);
                }
                else {
                    Message.count({userTo: username, seen: false}, function(err, pendingMessagesCount) {
                        if (err)
                            return reply(err).code(500);

                        return reply({message: 'success', pendingMessagesCount: pendingMessagesCount});
                    });
                }
            });
        }
    });
};