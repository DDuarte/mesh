'use strict';

var Nodemailer = require('nodemailer'),
    Joi = require('joi'),
    uid = require('rand-token').uid,
    redis = require('redis'),
    client = redis.createClient(),
    User = require('../models/user'),
    Boom = require('boom'),
    sendMail = require('../common/sendMail'),
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

    server.route({
        method: 'POST',
        path: '/forgotPassword',
        config: {
            validate: {
                payload: {
                    username: schema.user.username.required()
                }
            },
            auth: false
        },
        handler: function (request, reply) {
            var username = request.payload.username;

            User.getByUsername(username).then(function (userData) {
                if (userData[0]) {
                    userData = userData[0].user;
                    var email = userData.email;
                    var token = uid(16);

                    client.hset("forgotpw_tokens", username, token);

                    var url = 'http://meshdev.ddns.net/dev/#/login?state=forgotPassword&token=' + token + '&username=' + username;
                    var html = "<b>Change your password at:</b><br><a href=\"" + url + '">' + url + '</a>';

                    sendMail(email, 'Password change', html, function (error) {
                        if (error) {
                            console.log("routes/register/sendMail: " + error);
                            reply(Boom.badImplementation('Internal error: failed to send email'));
                        }
                    });

                    reply().code(200);

                } else {
                    reply(Boom.badRequest('Invalid username'));
                }
            }, function () {
                reply(Boom.badRequest('Invalid username'));
            });
        }
    });

    server.route({
        method: 'POST',
        path: '/changePassword',
        config: {
            validate: {
                payload: {
                    username: schema.user.username.required(),
                    token: schema.token.token.required(),
                    password: schema.user.password.required()
                }
            },
            auth: false
        },
        handler: function (request, reply) {
            var username = request.payload.username;
            var pl_token = request.payload.token;
            var newPass = request.payload.password;

            client.hget("forgotpw_tokens", username, function (err, token) {
                if (err || !token || token !== pl_token) {
                    reply(Boom.badRequest('The provided token is not valid'));
                    return;
                }

                client.del('forgotpw_tokens', username);

                User.changePassword(username, newPass).then(function (user) {
                    reply().code(200);
                }).catch(function () {
                    reply(Boom.badImplementation('Cannot change password'));
                });
            });
        }
    });
};
