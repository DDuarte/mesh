'use strict';

var Group = require('../models/group'),
    User = require('../models/user'),
    Joi = require('joi'),
    schema = require('../schema'),
    Boom = require('boom');

module.exports = function (server) {

    server.route({
        method: 'POST',
        path: '/groups',
        config: {
            auth: 'token',
            validate: {
                payload: {
                    name: schema.group.name.required(),
                    description: schema.group.description.required()
                }
            }
        },
        handler: function (request, reply) {
            var groupInfo = request.payload;
            groupInfo.adminName = request.auth.credentials.username;
            groupInfo.creationDate = (new Date()).toISOString();
            // check if group already exists
            Group.getByName(groupInfo.name)
                .then(function () {
                    return reply(Boom.badRequest('Group already exists'));
                })
                .catch(Error, function (error) {
                    return reply(Boom.badImplementation(error.message));
                })
                // If group doesn't exist, create it
                .catch(function () {
                    Group.create(groupInfo)
                        .then(function () {
                            reply().code(200);
                        })
                        .catch(function (error) {
                            return reply(Boom.badImplementation('Internal server error'));
                        });
                });
        }
    });

    server.route({
        method: 'GET',
        path: '/groups/{id}',
        config: {
            auth: 'token',
            validate: {
                params: {
                    id: schema.group.id.required()
                }
            }
        },
        handler: function (request, reply) {
            Group.getById(request.params.id)
                .then(function (group) {
                    reply(group);
                })
                .catch(Error, function (error) {
                    return reply(Boom.badImplementation(error.message));
                })
                .catch(function () {
                    return reply(Boom.notFound('Group not found'));
                });
        }
    });

    server.route({
        path: '/groups/{id}/admins',
        method: 'GET',
        config: {
            auth: 'token',
            validate: {
                params: {
                    id: schema.group.id.required()
                }
            }
        },
        handler: function (request, reply) {
            var groupId = request.params.id;
            Group.getById(groupId)
                .then(function () {
                    Group.getAdministrators(groupId)
                        .then(function (administrators) {
                            reply(administrators);
                        })
                        .catch(Error, function (error) {
                            reply(Boom.badImplementation(error.message));
                        });

                })
                .catch(Error, function () {
                    reply(Boom.badImplementation('Internal Server Error'));
                })
                .catch(function () {
                    reply(Boom.notFound('Group not found'));
                });
        }
    });

    server.route({
        path: '/group/{id}/members',
        method: 'GET',
        config: {
            auth: 'token',
            validate: {
                params: {
                    id: schema.group.id.required()
                }
            }
        },
        handler: function (request, reply) {
            var groupId = request.params.id;
            Group.getById(groupId)
                .then(function () {
                    Group.getMembers(groupId)
                        .then(function (members) {
                            reply(members);
                        })
                        .catch(Error, function (error) {
                            reply(Boom.badImplementation(error.message));
                        });

                })
                .catch(Error, function () {
                    reply(Boom.badImplementation('Internal Server Error'));
                })
                .catch(function () {
                    reply(Boom.notFound('Group not found'));
                });
        }
    });

    server.route({
        path: '/groups/{id}/admins',
        method: 'POST',
        config: {
            auth: 'token',
            validate: {
                params: {
                    id: schema.group.id.required()
                },
                payload: {
                    adminName: schema.user.username.required()
                }
            }
        },
        handler: function (request, reply) {
            Group.isAdmin(request.params.id, request.auth.credentials.username)
                .then(function (isAdmin) {
                    if (!isAdmin)
                        return reply(Boom.badRequest('Requesting user is not an administrator of the group'));

                    Group.addAdmin(request.params.id, request.payload.adminName)
                        .then(function () {
                            reply("Administrator successfully added").code(200);
                        })
                        .catch(function (error) {
                        });
                })
                .catch(Error, function (error) {
                    reply(Boom.badImplementation(error.message));
                });
        }
    });

    server.route({
        path: '/groups/{id}/members',
        method: 'POST',
        config: {
            auth: 'token',
            validate: {
                params: {
                    id: schema.group.id.required()
                },
                payload: {
                    adminName: schema.user.username.required()
                }
            }
        },
        handler: function (request, reply) {
            Group.isMember(request.params.id, request.auth.credentials.username)
                .then(function (isMember) {
                    if (!isMember)
                        return reply(Boom.badRequest('Requesting user is not a member of the group'));

                    Group.addAdmin(request.params.id, request.payload.adminName)
                        .then(function () {
                            reply("Administrator successfully added").code(200);
                        })
                        .catch(function () {
                            reply(Boom.badImplementation('Internal Server Error'));
                        });
                })
                .catch(Error, function (error) {
                    reply(Boom.badImplementation(error.message));
                });
        }
    });

    server.route({
        path: '/groups/{id}/galleries',
        method: 'GET',
        config: {
            auth: 'token',
            validate: {
                params: {
                    id: schema.group.id.required()
                }
            }
        },
        handler: function (request, reply) {
            var groupId = request.params.id;
            Group.isMember(groupId, request.auth.credentials.username)
                .then(function (isMember) {
                    // if user is member of the group, get the private and public galleries
                    if (isMember) {
                        Group.getAllGalleries(groupId)
                            .then(function (galleries) {
                                reply(galleries);
                            })
                            .catch(Error, function (error) {
                                reply(Boom.badImplementation(error.message));
                            });
                    }
                    else {
                        Group.getPublicGalleries(groupId)
                            .then(function (galleries) {
                                reply(galleries);
                            })
                            .catch(Error, function (error) {
                                reply(Boom.badImplementation(error.message));
                            });
                    }
                })
                .catch(Error, function (error) {
                    reply(Boom.badImplementation(error.message));
                });
        }
    });

    server.route({
        path: '/groups/{id}/galleries/{galleryName}',
        method: 'GET',
        config: {
            auth: 'token',
            validate: {
                params: {
                    id: schema.group.id.required(),
                    galleryName: schema.group.galleryName.required()
                }
            }
        },
        handler: function (request, reply) {
            var groupId = request.params.id;
            var galleryName = request.params.galleryName;
            Group.getById(groupId)
                .then(function () {
                    Group.getGallery(groupId, galleryName)
                        .then(function (gallery) {
                            Group.getModels(groupId, galleryName)
                                .then(function (models) {
                                    reply(models);
                                })
                                .catch(Error, function (error) {
                                    reply(Boom.badImplementation(error.message));
                                });
                        })
                        .catch(Error, function(error) {
                            return reply(error.message);
                        })
                        .catch(function(reason) {
                            return reply(Boom.badRequest(reason));
                        });
                })
                .catch(Error, function () {
                    reply(Boom.badImplementation(error.message));
                });
        }
    });
};