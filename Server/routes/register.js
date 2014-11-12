'use strict';

var User = require('../models/user');
var Boom = require('boom');
var Joi = require('joi');

module.exports = function (server) {

    server.route({
        method: 'POST',
        path: '/register',
        config: {
            auth: false,
            validate: {
                payload: {
                    firstName: Joi.string().required(),
                    lastName: Joi.string().required(),
                    username: Joi.string().required(),
                    email: Joi.string().email().required(),
                    password: Joi.string().required(),
                    birthdate: Joi.date().required(),
                    country: Joi.string().required() // move list to server and validate properly
                }
            }
        },
        handler: function (request, reply) {
            var username = request.payload.username;
            var email = request.payload.email;

            User.getByUsername(username).then(function (userData) {
                if (userData[0]) {
                    return reply(Boom.conflict('Existing user'));
                }
            });

            // TODO: Implement user.getByEmail
            /*User.getByEmail(email).then(function (userData) {
                if (userData[0]) {
                    return reply(Boom.conflict('Existing user'));
                }
            });*/

            User.create(request.payload);
            // TODO: return error if something invalid
        }
    });
};
