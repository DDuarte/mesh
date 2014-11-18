'use strict';

var User = require('../models/user');
var Boom = require('boom');

var schema = require('../schema');

module.exports = function (server) {

    server.route({
        method: 'POST',
        path: '/register',
        config: {
            auth: false,
            validate: {
                payload: {
                    firstName: schema.user.firstName.required().max(20),
                    lastName: schema.user.lastName.required().max(20),
                    username: schema.user.username.required().min(3).max(20),
                    email: schema.user.email.required(),
                    password: schema.user.password.required().max(256),
                    birthdate: schema.user.birthdate.required(),
                    country: schema.user.country.required() // TODO: Include all countries in the list
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

            User.getByEmail(email).then(function (userData) {
                if (userData[0]) {
                    return reply(Boom.conflict('Existing user'));
                }
            });

            User.create(request.payload).then(function () {
                reply().code(200);
            }).catch( function () {
                reply(Boom.badImplementation('Failed to insert the user into the database'));
            });
        }
    });
};
