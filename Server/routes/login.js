'use strict';

var User = require('../models/user'),
    Boom = require('boom'),
    jwt = require('jsonwebtoken'),
    client = require('../common/redisClient'),
    schema = require('../schema'),
    uid = require('rand-token').uid,
    sendMail = require('../common/sendMail');

var privateKey = 'Kitties';
var tokenTTL = 7200;

module.exports = function (server) {

    var validate = function (rToken, decodedToken, callback) {
        console.log(rToken);
        console.log(decodedToken);

        if (decodedToken) {
            console.log(decodedToken.username.toString());
        }

        client.get(decodedToken.username, function (err, tok) {
            if (err) return callback(null, false);
            if (!tok) {
                return callback(null, false);
            } else if (tok == rToken) {
                client.ttl(decodedToken.username, function (err, data) {
                    if (!err && data != -1) {
                        client.expire(decodedToken.username, tokenTTL);
                    }
                });
                return callback(null, true, decodedToken);
            } else {
                return callback(null, false);
            }
        });
    };

    server.pack.register(require('hapi-auth-jsonwebtoken'), function (err) {
        server.auth.strategy('token', 'jwt', {key: privateKey, validateFunc: validate});
    });

    server.route({
        method: 'POST',
        path: '/login',
        config: {
            auth: false,
            validate: {
                payload: {
                    username: schema.user.username.required(),
                    password: schema.user.password.required(),
                    rememberMe: schema.user.rememberMe
                }
            }
        },
        handler: function (request, reply) {
            var user = request.payload.username;
            var password = request.payload.password;
            var rememberMe = request.payload.rememberMe ? request.payload.rememberMe : false;
            User.getByUsername(user).then(function (userData) {
                if (!userData.active) {
                    return reply(Boom.forbidden('Account is not activated'));
                }
                var insertedPasswordHash = User.generatePasswordHash(user, password);
                console.log(insertedPasswordHash);
                if (userData.passwordHash && insertedPasswordHash.toLowerCase() == userData.passwordHash.toLowerCase()) {
                    client.get(user, function (err, tok) {
                        if (err) return reply(Boom.badImplementation(err));

                        if (tok) {
                            client.ttl(user, function (err, data) {
                                if (!err && data != -1) {
                                    client.expire(user, tokenTTL);
                                }
                            });
                            return reply({username: user, token: tok, avatar: userData.avatar });
                        } else {
                            var token = jwt.sign({username: user}, privateKey);
                            client.set(user, token);
                            if (!rememberMe)
                                client.expire(user, tokenTTL);
                            return reply({username: user, token: token, avatar: userData.avatar });
                        }
                    });
                } else {
                    reply(Boom.badRequest('Invalid password'));
                }
            }, function () {
                reply(Boom.badRequest('Invalid username'));
            });
        }
    });

    server.route({
        method: 'POST',
        path: '/forgotPassword',
        config: {
            validate: {
                payload: {
                    email: schema.user.email.required()
                }
            },
            auth: false
        },
        handler: function (request, reply) {
            var email = request.payload.email;

            User.getByEmail(email).then(function (userData) {
                if (userData[0]) {
                    var token = uid(16);
                    var username = userData[0].user.username;

                    var tokenUser = token + '-' + username;
                    client.hset("forgotpw_tokens", email, tokenUser);

                    var url = 'http://meshdev.ddns.net/dev/#/login?state=forgotPassword&token=' + tokenUser + '&email=' + email;
                    var html = "<b>Change your password at:</b><br><a href=\"" + url + '">' + url + '</a>';

                    sendMail(email, 'Password change', html, function (error) {
                        if (error) {
                            console.log("routes/register/sendMail: " + error);
                            reply(Boom.badImplementation('Internal error: failed to send email'));
                        } else {
                            reply().code(200);
                        }
                    });
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
                    email: schema.user.email.required(),
                    token: schema.token.token.required(),
                    password: schema.user.password.required()
                }
            },
            auth: false
        },
        handler: function (request, reply) {
            var email = request.payload.email;
            var pl_token = request.payload.token;
            var newPass = request.payload.password;

            client.hget("forgotpw_tokens", email, function (err, tokenUser) {
                var split = tokenUser.split('-');
                var token = split[0];
                var username = split[1];

                if (err || !token || token !== pl_token) {
                    reply(Boom.badRequest('The provided token is not valid'));
                    return;
                }

                client.del('forgotpw_tokens', email);

                User.changePassword(username, newPass).then(function (user) {
                    reply().code(200);
                }).catch(function () {
                    reply(Boom.badImplementation('Cannot change password'));
                });
            });
        }
    });
};
