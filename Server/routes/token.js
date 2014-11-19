'use strict';

var Nodemailer = require('nodemailer'),
    Joi = require('joi'),
    uid = require('rand-token').uid,
    redis = require('redis'),
    client = redis.createClient(),
    User = require('../models/user'),
    Boom = require('boom'),
    schema = require('../schema');


module.exports = function (server) {
    server.route({
        method: 'POST',
        path: '/activateToken',
        config: {
            validate: {
                payload: {
                    token: schema.token.token.required(),
                    username: schema.user.username.required()
                }
            },
            auth: false
        },
        handler: function (request, reply) {
            client.hget("account_tokens", request.payload.username, function (err, token) {
                if (err || !token || token !== request.payload.token) {
                    reply(Boom.badRequest('The provided token is not valid'));
                    return;
                }

                client.del('account_tokens', request.payload.username);

                User.activate(request.payload.username).then(function (user) {
                    reply().code(200);
                }).catch(function () {
                    reply(Boom.badImplementation('Specified user could not be activated in the database'));
                });
            });
        }
    });
};
