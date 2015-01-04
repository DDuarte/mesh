'use strict';

var User = require('../models/user'),
    Promise = require('bluebird'),
    db = require('../common/db'),
    schema = require('../schema'),
    Boom = require('boom'),
    _ = require('lodash'),
    Joi = require('joi'),
    Notification = require('../models/notifications').Notification,
    Message = require('../models/message');

module.exports = function (server) {

    /*
    server.route({
        method: 'POST',
        path: '/notifications/test',
        config: {
            auth: false,
            validate: {
                payload: {
                    userFrom: schema.notification.userFrom.required(),
                    userTo: schema.notification.userTo.required(),
                    message: schema.notification.message.required(),
                    url: schema.notification.url,
                    image: schema.notification.image
                }
            }
        },
        handler: function(request, reply) {
            // var userFrom = request.auth.credentials.username;

            Promise.join(User.getByUsername(request.payload.userFrom), User.getByUsername(request.payload.userTo),
                function(userFrom, userTo) {
                    Notification.notifyUser(userTo,userFrom, request.payload.message, request.payload.url, request.payload.image)
                        .then(function(notification) {
                            console.log("Success");
                            return reply(notification).code(200);
                        })
                        .catch(function(){
                            return reply(Boom.badImplementation('Internal server error'));
                        });
                })
                .catch(function() {
                    return reply(Boom.badImplementation('Internal server error'));
                });
        }
    });
    */

    server.route({
        method: 'GET',
        path: '/notifications',
        config: {
            auth: 'token',
            validate: {
                query: {
                    userFrom: schema.notification.userFrom,
                    url: schema.notification.url,
                    image: schema.notification.image,
                    message: schema.notification.message,
                    seen: schema.notification.seen,
                    date: schema.notification.date,
                    limit: Joi.number().greater(0),
                    skip: Joi.number().greater(0)
                }
            }
        },
        handler: function(request, reply) {
            var username = request.auth.credentials.username;

            var limit = request.query.limit || 10;
            var skip = request.query.skip || 0;
            delete request.query.limit;
            delete request.query.skip;

            var query = request.query;
            query.userTo = username;

            // TODO allow gte and lte's in the date

            Notification.count({userTo: username, seen: false}, function(err, pendingNotificationsCount) {
                if (err)
                    return reply(err).code(500);
                Message.count({userTo: username, seen: false}, function(err, pendingMessagesCount) {
                    if (err)
                        return reply(err).code(500);
                    Notification.find(query).sort('-date').skip(skip).limit(limit).exec(function (err, notifications) {
                        if (err)
                            return reply(err).code(500);
                        return reply({
                            notifications: notifications,
                            pendingNotificationsCount: pendingNotificationsCount,
                            pendingMessagesCount: pendingMessagesCount
                        });
                    });
                });
            });
        }
    });

    server.route({
        method: 'PATCH',
        path: '/notifications/{_id}',
        config: {
            auth: 'token',
            validate: {
                params: {
                    _id: Joi.string().min(24).max(24).required()
                },
                payload: {
                    seen: schema.notification.seen
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
                seen: request.payload.seen
            };

            Notification.update(query, updatedData, { multi: false }, function(err, numAffected) {
                if(err) {
                    return reply(err).code(500);
                }
                else if(numAffected == 0) {
                    return reply(Boom.badRequest('User does not have that notification')).code(400);
                }
                else {
                    Notification.count({userTo: username, seen: false}, function(err, pendingNotificationsCount) {
                        if (err)
                            return reply(err).code(500);

                        return reply({message: 'success', pendingNotificationsCount: pendingNotificationsCount});
                    });
                }
            });
        }
    });
};