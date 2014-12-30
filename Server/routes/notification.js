'use strict';

var User = require('../models/user'),
    Promise = require('bluebird'),
    client = require('../common/redisClient'),
    schema = require('../schema'),
    Boom = require('boom'),
    _ = require('lodash'),
    Joi = require('joi'),
    Notification = require('../models/notifications').Notification;

module.exports = function (server) {

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

    server.route({
        method: 'GET',
        path: '/notifications',
        config: {
            auth: 'token',
            validate: {
                params: {
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

            var limit = request.params.limit || 10;
            var skip = request.params.skip || 0;

            var query = request.params;
            query.userTo = username;

            // TODO allow gte and lte's in the date

            Notification.find(query).sort('-date').skip(skip).limit(limit).exec(function(err, notifications) {
                if (err)
                    return reply(err).code(500);
                return reply(notifications);
            });
        }
    })
};