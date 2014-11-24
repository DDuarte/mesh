'use strict';

var User = require('../models/user'),
    Boom = require('boom'),
    uid = require('rand-token').uid,
    redis = require('redis'),
    client = redis.createClient(),
    sendMail = require('../common/sendMail'),
    schema = require('../schema');

module.exports = function (server) {

    server.route({
        method: 'POST',
        path: '/register',
        config: {
            auth: false,
            validate: {
                payload: {
                    firstName: schema.user.firstName.required(),
                    lastName: schema.user.lastName.required(),
                    username: schema.user.username.required(),
                    email: schema.user.email.required(),
                    password: schema.user.password.required(),
                    birthdate: schema.user.birthdate.required(),
                    country: schema.user.country.required()
                }
            }
        },
        handler: function (request, reply) {
            var username = request.payload.username;
            var email = request.payload.email;

            request.payload.active = false;
            User.create(request.payload).then(function () {
                var token = uid(16);

                // associated the generated token with the user
                client.hset("account_tokens", username, token);

                var url = 'http://meshdev.ddns.net/dev/#/activate?token=' + token + '&username=' + username; // TODO: change server base url
                var html = "<b>Greetings from the Mesh team! You can activate your account here:</b><br><a href=\"" + url + '">' + url + '</a>';

                sendMail(email, 'Account activation', html, function (error) {
                    if (error) {
                        console.log("routes/register/sendMail: " + error);
                        reply(Boom.badImplementation('Internal error: failed to send email'));
                    } else {
                        reply().code(200);
                    }
                });
            }).catch(function (err) {
                // reply(Boom.conflict('Existing user')); TODO FIX
                console.log("routes/register: " + err + " - " + JSON.stringify(request.payload));
                reply(Boom.badImplementation('Failed to insert the user into the database'));
            });
        }
    });

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
