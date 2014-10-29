'use strict';

var _ = require('lodash'),
    Hapi = require('hapi'),
    Joi = require('joi'),
    fuzzy = require('fuzzy'),
    jwt = require('jsonwebtoken'),
    redis = require('redis'),
    client = redis.createClient(),
    Model = require('./models/model'),
    User = require('./models/user');

client.on('error', function (err) {
    console.log('Redis error ' + err);
});

// Create a server with a host and port
var server = Hapi.createServer(process.argv[2] || 8001, { cors: true });

var privateKey = 'Kitties';

// Test route
server.route({
    method: 'GET',
    path: '/',
    handler: function (request, reply) {
        reply('Hello! Yes, this is working.');
    }
});

function getUser(request, reply) {
    var id = request.params.id;

    client.incr(id + '_counter', function (err, counter) {
        reply({
            'id': id,
            'counter': counter
        });
    });
}

server.route({
    method: 'GET',
    path: '/users/{id}',
    handler: getUser
});

function getModel(request, reply) {
    Model.getById(request.params.id).then(function (results) {
        if (results.length == 0) {
            reply('No such model.').code(404);
        } else {
            reply(results[0].model);
        }
    }, function (error) {
        reply('Internal error').code(500);
    });
}

server.route({
    method: 'GET',
    path: '/models/{id}',
    handler: getModel
});

var default_tags = ['abstract', 'art', 'black', 'blue', 'dark', 'drawing', 'girl', 'green',
    'illustration', 'light', 'model', 'photo', 'photography', 'street', 'woman', 'pokemon',
    'polygon', 'animal', 'human body'];

function getTags(request, reply) {
    client.sadd('tags', default_tags); // ignores if tags already exist
    // TODO: Call sadd on redis when models are created

    client.smembers('tags', function (err, tags) {
        if (err) throw err;

        var matches = [];
        var filter = request.query.filter;
        if (filter) {
            var results = fuzzy.filter(filter, tags);
            matches = results.map(function (m) {
                return m.string;
            });
        } else {
            matches = tags;
        }

        reply(matches);
    });
}

server.route({
    method: 'GET',
    path: '/tags',
    handler: getTags,
    config: {
        validate: {
            query: {
                filter: Joi.string().max(30).optional()
            }
        }
    }
});

var validate = function (rToken, decodedToken, callback) {
    console.log(rToken);
    console.log(decodedToken);

    if (decodedToken) {
        console.log(decodedToken.username.toString());
    }

    client.get(decodedToken.username, function (err, tok) {
        if (err) return reply(err).code(500);
        if (!tok) {
            return callback(null, false);
        } else if (tok == rToken) {
            return callback(null, true, decodedToken);
        } else {
            return callback(null, false);
        }
    });
};

server.pack.register(require('hapi-auth-jsonwebtoken'), function (err) {

    server.auth.strategy('token', 'jwt', {key: privateKey, validateFunc: validate});

    server.route({
        method: 'GET',
        path: '/tokenRequired',
        config: {auth: 'token'},
        handler: function (request, reply) {
            var replyObj = {
                text: 'I am a JSON response, and you needed a token to get me.',
                credentials: request.auth.credentials
            };
            reply(replyObj);
        }
    });

    server.route({
        method: 'POST',
        path: '/login',
        config: {auth: false},
        handler: function (request, reply) {
            var user = request.payload.username;
            var password = request.payload.password;

            console.log(user);
            console.log(password);

            User.getByUsername(user).then(function (userData) {
                if (userData[0]) {
                    userData = userData[0].user;
                    console.log(userData);
                    var insertedPasswordHash = User.generatePasswordHash(user, password);
                    console.log(insertedPasswordHash);
                    if (userData.passwordHash && insertedPasswordHash.toLowerCase() == userData.passwordHash.toLowerCase()) {
                        client.get(user, function (err, tok) {
                            if (err) reply({error: err}).code(500);

                            if (tok) {
                                console.log("User '" + user + "' is already signed in.");
                                return reply({token: tok});
                            } else {
                                var token = jwt.sign({username: user}, privateKey);
                                client.set(user, token);
                                return reply({token: token});
                            }
                        });
                    } else {
                        reply('Invalid password.').code(401);
                    }
                } else {
                    reply('Invalid username.').code(401);
                }
            });
        }
    });

    server.route({
        method: 'GET',
        path: '/noTokenRequired',
        config: {auth: false},
        handler: function (request, reply) {
            var replyObj = {text: 'I am JSON response, but you did not need a token to get me'};
            reply(replyObj);
        }
    });


    server.route({
        method: 'POST',
        path: '/models/{id}/comments',
        config: {
            auth: 'token',
            validate: {
                params: {
                    id: Joi.number().integer().min(1),
                    comment: Joi.string().min(1).max(1024).trim()
                }
            }
        },
        handler: function (request, reply) {
            Model.addComment(request.params.id, request.auth.credentials.username, request.payload.comment).then(function (result) {
                if (result.length == 0) {
                    reply('No such model.').code(404);
                } else {
                    reply(result);
                }
            }, function (error) {
                reply('Internal error').code(500);
            });
        }
    })

});


server.pack.register({plugin: require('hapi-route-directory'), options: {path: '/api'}}, function (err) {
    if (err)
        throw err;
});

server.pack.register({plugin: require('hapi-routes-status'), options: {path: '/status'}}, function (err) {
    if (err)
        throw err;
});


// Start the server
server.start();
