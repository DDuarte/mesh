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
        method: 'GET',
        path: '/activateToken',
        config: {
            validate: {
                query: {
                    token: schema.token.required(),
                    username: schema.user.username.required()
                }
            },
            auth: false
        },
        handler: function (request, reply) {
            var token = client.hget("account_tokens", request.query.username);

            if (!token || token !== request.query.token) {
                reply(Boom.badRequest('The provided token is not valid'));
            }

            client.del('account_tokens', request.auth.credentials.username);

            User.activate(request.auth.credentials.username).then(function (user) {
                reply.redirect(server.tokenActivationRedirectPath); //TODO: replace hardcoded path
            }).catch(function () {
                reply(Boom.badImplementation('Specified user could not be created in the database'));
            });
        }
    });
};
