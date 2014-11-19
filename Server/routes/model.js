'use strict';

var Model = require('../models/model.js');
var Promise = require('bluebird');
var Boom = require('boom');

var schema = require('../schema');

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
                    id: schema.model.id.required()
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
                    id: schema.model.id.required()
                },
                query: {
                    startdate: schema.model.date.optional()
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
                    id: schema.model.id.required()
                },
                payload: {
                    comment: schema.model.comment.required()
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
                    id: schema.model.id.required()
                },
                payload: {
                    date: schema.model.date.required()
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
                    id: schema.model.id.required()
                },
                payload: {
                    vote: schema.model.vote.required()
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
                    id: schema.model.id.required()
                }
            }
        },
        handler: function (request, reply) {
            Model.deleteVote(request.params.id, request.auth.credentials.username).then(function (result) {
                if (!result) {
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