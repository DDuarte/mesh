'use strict';

var User = require('../models/user'),
    Promise = require('bluebird'),
    client = require('../common/redisClient'),
    schema = require('../schema'),
    Boom = require('boom'),
    _ = require('lodash'),
    Notification = require('../models/notification');

module.exports = function (server) {

    server.route({
        method: 'POST',
        path: '/notification/test',
        config: {
            auth: false,
            validate: {
                payload: {
                    userFrom: schema.notification.userFrom.required(),
                    userTo: schema.notification.userTo.required(),
                    message: schema.notification.message.required()
                }
            }
        },
        handler: function(request, reply) {
            // var userFrom = request.auth.credentials.username;

            Promise.join(User.getByUsername(request.payload.userFrom), User.getByUsername(request.payload.userTo),
                function(userFrom, userTo) {
                    Notification.notifyUser(userTo,userFrom, request.payload.message)
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
};