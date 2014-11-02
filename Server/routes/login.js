var User = require('../models/user');
var Boom = require('boom');
var Joi = require('joi');
var jwt = require('jsonwebtoken');
var redis = require('redis');
var client = redis.createClient();

var privateKey = 'Kitties';

module.exports = function (server) {
    server.route({
        method: 'POST',
        path: '/login',
        config: {
            auth: false,
            validate: {
                payload: {
                    username: Joi.string().required(),
                    password: Joi.string().required()
                }
            }
        },
        handler: function (request, reply) {
            var user = request.payload.username;
            var password = request.payload.password;

            User.getByUsername(user).then(function (userData) {
                if (userData[0]) {
                    userData = userData[0].user;
                    console.log(userData);
                    var insertedPasswordHash = User.generatePasswordHash(user, password);
                    console.log(insertedPasswordHash);
                    if (userData.passwordHash && insertedPasswordHash.toLowerCase() == userData.passwordHash.toLowerCase()) {
                        client.get(user, function (err, tok) {
                            if (err) return reply(Boom.badImplementation(err));

                            if (tok) {
                                return reply({token: tok});
                            } else {
                                var token = jwt.sign({username: user}, privateKey);
                                client.set(user, token);
                                return reply({token: token});
                            }
                        });
                    } else {
                        reply(Boom.badRequest('Invalid password'));
                    }
                } else {
                    reply(Boom.badRequest('Invalid username'));
                }
            });
        }
    });
};