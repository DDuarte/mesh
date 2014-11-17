'use strict';

var User = require('../models/user');
var Boom = require('boom');
var Joi = require('joi');

var schema = require('../schema');

module.exports = function (server) {

    server.route({
        method: 'POST',
        path: '/register',
        config: {
            auth: false,
            validate: {
                payload: {
                    firstName: schema.user.firstName.required(),         // TODO validate length
                    lastName: schema.user.lastName.required(),          // TODO validate length
                    username: schema.user.username.required(),          // TODO validate length
                    email: schema.user.email.required(),
                    password: schema.user.password.required(),          // TODO validate length
                    birthdate: schema.user.birthdate.required(),
                    country: schema.user.country.required() // move list to server and validate properly
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

			reply().code(200);
        }
    });
};
