'use strict';

var Fs = require('fs'),
    Model = require('../models/model.js'),
    Promise = require('bluebird'),
    Boom = require('boom'),
    Path = require('path'),
    Joi = require('joi'),
    schema = require('../schema');

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
                reply(Boom.badImplementation('Internal error: ' + error));
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
                    reply(Boom.notFound('No such model'));
                } else {
                    reply(result);
                }
            }, function (error) {
                reply(Boom.badImplementation('Internal error: ' + error));
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
                    reply(Boom.notFound('No such comment'));
                } else {
                    reply(result);
                }
            }, function (error) {
                reply(Boom.badImplementation('Internal error: ' + error));
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
                    reply(Boom.notFound('No such model'));
                } else {
                    reply(result);
                }
            }, function (error) {
                reply(Boom.badImplementation('Internal error: ' + error));
            });
        }
    });

    server.route({
        method: 'POST',
        path: '/models/{id}/galleries',
        config: {
            auth: 'token',
            validate: {
                params: {
                    id: schema.model.id.required()
                },
                payload: {
                    galleries: Joi.array().includes(Joi.string()).required()
                }
            }
        },
        handler: function (request, reply) {
            Model.replaceGalleries(request.params.id, request.payload.galleries)
                .then(function () {
                    reply().code(200);
                })
                .catch(function (error) {
                    reply(Boom.badImplementation('Internal error: ' + error));
                });
        }
    });

    server.route({
        method: 'POST',
        path: '/models/{id}/groups',
        config: {
            auth: 'token',
            validate: {
                params: {
                    id: schema.model.id.required()
                },
                payload: {
                    groups: Joi.array().includes(Joi.string()).required()
                }
            }
        },
        handler: function (request, reply) {
            Model.replaceGroups(request.params.id, request.payload.groups)
                .then(function () {
                    reply().code(200);
                })
                .catch(function (error) {
                    reply(Boom.badImplementation('Internal error: ' + error));
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
                    reply(Boom.notFound('No such model'));
                } else {
                    reply(result);
                }
            }, function (error) {
                reply(Boom.badImplementation('Internal error: ' + error));
            });
        }
    });

    server.route({
        method: 'PATCH',
        path: '/models/{id}',
        config: {
            auth: 'token',
            validate: {
                params: {
                    id: schema.model.id.required()
                },
                payload: {
                    description: schema.model.description.required(),
                    tags: schema.model.tags.required(),
                    isPublic: schema.model.isPublic.required()
                }
            }
        },
        handler: function (request, reply) {
            Model.getById(request.params.id, request.auth.credentials ? request.auth.credentials.username : '')
                .then(function (results) {
                    if (results.length == 0)
                        return reply(Boom.notFound('Model does not exist'));

                    var ownsModel = results[0].ownsModel;

                    if (!ownsModel)
                        return reply(Boom.unauthorized('User is not owner of the model'));

                    var modelData = request.payload;
                    Model.updateById(request.params.id, modelData.description, modelData.isPublic, modelData.tags)
                        .then(function (model) {
                            reply(model).code(200);
                        })
                        .catch(function () {
                            reply(Boom.badImplementation('Internal server error'));
                        })
                })
                .catch(function () {
                    reply(Boom.badImplementation('Internal server error'));
                })
        }
    });

    server.route({
        method: 'DELETE',
        path: '/models/{id}',
        config: {
            auth: 'token',
            validate: {
                params: {
                    id: schema.model.id.required()
                }
            }
        },
        handler: function (request, reply) {
            Model.getById(request.params.id, request.auth.credentials ? request.auth.credentials.username : '')
                .then(function (results) {

                    if (results.length == 0)
                        return reply(Boom.notFound('Model does not exist'));

                    var ownsModel = results[0].ownsModel;

                    if (!ownsModel)
                        return reply(Boom.unauthorized('User is not owner of the model'));

                    Model.deleteById(request.params.id)
                        .then(function () {
                            return reply().code(200);
                        })
                        .catch(function () {
                            return reply(Boom.badImplementation('Error deleting model'));
                        })
                });
        }
    });

    server.route({
        method: 'GET',
        path: '/models/{id}/galleries',
        config: {
            validate: {
                params: {
                    id: schema.model.id.required()
                }
            }
        },
        handler: function (request, reply) {
            Model.getPublishedGalleries(request.params.id)
                .then(function (galleries) {
                    return reply(galleries);
                })
                .catch(function () {
                    return reply(Boom.badImplementation('Internal server error'));
                });
        }
    });

    server.route({
        method: 'GET',
        path: '/models/{id}/files',
        config: {
            validate: {
                params: {
                    id: schema.model.id.required()
                }
            }
        },
        handler: function (request, reply) {
            Model.getById(request.params.id, request.auth.credentials ? request.auth.credentials.username : '')
                .then(function (results) {
                    if (results.length == 0)
                        return reply(Boom.notFound('Model does not exist'));

                    var model = results[0].model;
                    var filePath = model.filePath;
                    var originalFilename = model.originalFilename;

                    return reply.file(filePath, {
                        filename: originalFilename,
                        mode: 'attachment'
                    });
                })
                .catch(Error, function (error) {
                    reply(Boom.badImplementation(error.message ? error.message : error));
                });
        }
    });

    server.route({
        method: 'GET',
        path: '/models/{id}/files/{filename}',
        config: {
            validate: {
                params: {
                    id: schema.model.id.required(),
                    filename: Joi.string().required()
                }
            }
        },
        handler: function (request, reply) {
            Model.getById(request.params.id, request.auth.credentials ? request.auth.credentials.username : '')
                .then(function (results) {
                    if (results.length == 0)
                        return reply(Boom.notFound('Model does not exist'));

                    var model = results[0].model;
                    var filePath = model.uncompressedFolderPath;
                    var originalFilename = model.originalFilename;
                    var fullPath = Path.join(filePath, request.params.filename);
                    return reply.file(fullPath, {
                        filename: request.params.filename,
                        mode: 'attachment'
                    });
                })
                .catch(Error, function (error) {
                    reply(Boom.badImplementation(error.message ? error.message : error));
                });
        }
    });

    server.route({
        method: 'GET',
        path: '/models/{id}/download',
        config: {
            validate: {
                params: {
                    id: schema.model.id.required()
                }
            }
        },
        handler: function (request, reply) {
            Model.getById(request.params.id, request.auth.credentials ? request.auth.credentials.username : '')
                .then(function (results) {
                    if (results.length == 0)
                        return reply(Boom.notFound('Model does not exist'));

                    var model = results[0].model;
                    var filePath = model.compressedFolderPath;
                    var originalFilename = model.originalFilename;

                    return reply.file(filePath, {
                        filename: originalFilename,
                        mode: 'attachment'
                    });
                })
                .catch(Error, function (error) {
                    reply(Boom.badImplementation(error.message ? error.message : error));
                });
        }
    });

    server.route({
        method: 'GET',
        path: '/models/{id}/filesInfo',
        config: {
            validate: {
                params: {
                    id: schema.model.id.required()
                }
            }
        },
        handler: function (request, reply) {
            Model.getById(request.params.id, request.auth.credentials ? request.auth.credentials.username : '')
                .then(function (results) {
                    if (results.length == 0)
                        return reply(Boom.notFound('Model does not exist'));

                    var model = results[0].model;
                    var filePath = model.filePath;
                    var originalFilename = model.originalFilename;

                    Fs.stat(filePath, function (err, stats) {

                        if (err)
                            return reply(err).code(500);

                        return reply({
                            filePath: filePath,
                            originalFilename: originalFilename,
                            size: stats['size'] // file size in bytes
                        });
                    });
                })
                .catch(Error, function (error) {
                    reply(Boom.badImplementation(error.message ? error.message : error));
                });
        }
    });
};