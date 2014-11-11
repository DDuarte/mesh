'use strict';

var _ = require('lodash'),
    Hapi = require('hapi'),
    Joi = require('joi'),
    fuzzy = require('fuzzy'),
    jwt = require('jsonwebtoken'),
    redis = require('redis'),
    client = redis.createClient(),
    Model = require('./models/model'),
    User = require('./models/user'),
    Boom = require('boom');

client.on('error', function (err) {
    console.log('Redis error ' + err);
});

// Create a server with a host and port
var server = Hapi.createServer(process.argv[2] || 8001, { cors: true });

require('./routes/')(server);

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

//TODO check permissions for these 2 routes
server.route({
    method: 'GET',
    path: '/models/{id}',
    handler: getModel
});
server.route({
    method: 'GET',
    path: '/models/{id}/comments',
    config: {
        validate: {
            params: {
                id: Joi.number().integer().min(1).required()
            },
            query: {
                startdate: Joi.string().isoDate().optional()
            }
        }
    },
    handler: function (request, reply) {
        Model.getCommentsOlderThan(request.params.id, request.query.startdate).then(function (result) {
            reply(result);
        }, function (error) {
            reply(Boom.badImplementation('Internal Error'));
        });
    }
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

server.route({
    method: 'POST',
    path: '/models/{id}/comments',
    config: {
        auth: 'token',
        validate: {
            params: {
                id: Joi.number().integer().min(1).required()
            },
            payload: {
                comment: Joi.string().min(1).max(1024).trim().required()
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
});

server.route({
    method: 'DELETE',
    path: '/models/{id}/comments',
    config: {
        auth: 'token',
        validate: {
            params: {
                id: Joi.number().integer().min(1).required()
            },
            payload: {
                date: Joi.string().isoDate().required()
            }
        }
    },
    handler: function (request, reply) {
        Model.removeComment(request.params.id, request.auth.credentials.username, request.payload.date).then(function (result) {
            if (!result) {
                reply('No such comment.').code(404);
            } else {
                reply(result);
            }
        }, function (error) {
            reply('Internal error').code(500);
        });
    }
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
