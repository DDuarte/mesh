'use strict';

var User = require('../models/user');
var Boom = require('boom');
var jwt = require('jsonwebtoken');
var client = require('../common/redisClient');

var schema = require('../schema');

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
            auth: 'token',
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
                if (userData[0]) {
                    userData = userData[0].user;
                    console.log(userData);
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
                } else {
                    reply(Boom.badRequest('Invalid username'));
                }
            }, function () {
                reply(Boom.badRequest('Invalid username'));
            });
        }
    });
};