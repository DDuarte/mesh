'use strict';

var User = require('../models/user'),
    Boom = require('boom'),
    jwt = require('jsonwebtoken'),
    db = require('../common/db'),
    schema = require('../schema'),
    uid = require('rand-token').uid,
    sendMail = require('../common/sendMail');

var privateKey = 'Kitties';
var tokenTTL = 7200;

module.exports = function (server) {

    var validate = function (rToken, decodedToken, callback) {

        if (decodedToken) {
        }

        db.redis.get(decodedToken.username, function (err, tok) {
            if (err) return callback(null, false);
            if (!tok) {
                return callback(null, false);
            } else if (tok == rToken) {
                db.redis.ttl(decodedToken.username, function (err, data) {
                    if (!err && data != -1) {
                        db.redis.expire(decodedToken.username, tokenTTL);
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
                if (userData.passwordHash && insertedPasswordHash.toLowerCase() == userData.passwordHash.toLowerCase()) {
                    db.redis.get(user, function (err, tok) {
                        if (err) return reply(Boom.badImplementation(err));

                        if (tok) {
                            db.redis.ttl(user, function (err, data) {
                                if (!err && data != -1) {
                                    db.redis.expire(user, tokenTTL);
                                }
                            });
                            return reply({username: user, token: tok, avatar: userData.avatar });
                        } else {
                            var token = jwt.sign({username: user}, privateKey);
                            db.redis.set(user, token);
                            if (!rememberMe)
                                db.redis.expire(user, tokenTTL);
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
            // Security: this route should always returns 200, even if the specified user
            // does not exist.
            var email = request.payload.email;

            User.getByEmail(email).then(function (userData) {
                if (userData[0]) {
                    var token = uid(16);
                    var username = userData[0].user.username;

                    var tokenUser = token + '-' + username;
                    db.redis.hset("forgotpw_tokens", email, tokenUser);

                    var url = 'http://meshdev.ddns.net/dev/#/login?state=forgotPassword&token=' + tokenUser + '&email=' + email;
                    var html = "<b>Change your password at:</b><br><a href=\"" + url + '">' + url + '</a>';

                    sendMail(email, 'Password change', html, function (error) {
                        if (error) {
                            console.log("routes/register/sendMail: " + error);
                        }

                        reply().code(200);
                    });
                } else {
                    reply().code(200); // invalid username
                }
            }, function () {
                reply().code(200); // invalid username
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

            db.redis.hget("forgotpw_tokens", email, function (err, tokenUser) {
                var split = tokenUser.split('-');
                var token = split[0];
                var username = split[1];

                if (err || !token || token !== pl_token) {
                    reply(Boom.badRequest('The provided token is not valid'));
                    return;
                }

                db.redis.del('forgotpw_tokens', email);

                User.changePassword(username, newPass).then(function (user) {
                    reply().code(200);
                }).catch(function () {
                    reply(Boom.badImplementation('Cannot change password'));
                });
            });
        }
    });
};
