'use strict';

var Model = require('../models/model.js');
var Joi = require('joi');
var Promise = require('bluebird');
var neo4j = require('neo4j');
var db = new neo4j.GraphDatabase(
    process.env['NEO4J_URL'] ||
    process.env['GRAPHENEDB_URL'] ||
    'http://localhost:7474'
);
var Boom = require('boom');

module.exports = function (server) {
    function getModel(request, reply) {
        console.log(request.auth.credentials);
        Model.getById(request.params.id, request.auth.credentials ? request.auth.credentials.username : '').then(function (results) {
            if (results.length == 0) {
                reply('No such model.').code(404);
            } else {
                reply(results[0]);
            }
        }, function (error) {
            reply('Internal error').code(500);
        });
    }

//TODO check permissions for these 2 routes
    server.route({
        method: 'GET',
        path: '/models/{id}',
        config: {
            auth: {
                mode: 'optional',
                strategy: 'token'
            },
            validate: {
                params: {
                    id: Joi.number().integer().min(1).required()
                }
            }
        },
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
                    comment: Joi.string().trim().min(1).max(1024).required()
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
                reply({message: 'Internal error: ' + error}).code(500);
            });
        }
    });

    server.route({
        method: 'POST',
        path: '/models/{id}/votes',
        config: {
            auth: 'token',
            validate: {
                params: {
                    id: Joi.number().integer().min(1).required()
                },
                payload: {
                    vote: Joi.string().trim().regex(/(DOWN)|(UP)/).required()
                }
            }
        },
        handler: function (request, reply) {
            Model.addVote(request.params.id, request.auth.credentials.username, request.payload.vote).then(function (result) {
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
        path: '/models/{id}/votes',
        config: {
            auth: 'token',
            validate: {
                params: {
                    id: Joi.number().integer().min(1).required()
                }
            }
        },
        handler: function (request, reply) {
            Model.deleteVote(request.params.id, request.auth.credentials.username).then(function (result) {
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
};