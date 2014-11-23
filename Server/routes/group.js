'use strict';

var Group = require('../models/group');
var User = require('../models/user');
var Joi = require('joi');
var GroupSchema = require('../schemas/group');
var Boom = require('boom');

module.exports = function (server) {

    server.route({
        path: '/groups',
        method: 'POST',
        config: {
            auth: true,
            validate: {
                payload: GroupSchema
            }
        },
        handler: function (request, reply) {
            var groupInfo = request.payload;
            groupInfo.adminName = request.auth.credentials.username;
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
        path: '/groups/{id}',
        method: 'GET',
        config: {
            auth: true
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
            auth: true,
            validate: {
                params: {
                    id: Joi.number().integer().min(1)
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
            auth: true,
            validate: {
                params: {
                    id: Joi.number().integer().min(1)
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
            auth: true,
            validate: {
                params: {
                    id: Joi.number().integer().min(1),
                    adminName: Joi.string().min(1)
                }
            }
        },
        handler: function (request, reply) {
            Group.isAdmin(request.params.id, request.auth.credentials.username)
                .then(function () {
                    Group.addAdmin(request.params.id, request.params.adminName)
                        .then(function () {
                            reply("Administrator successfully added").code(200);
                        })
                        .catch(function (error) {
                        });
                })
                .catch(Error, function (error) {
                    reply(Boom.badImplementation(error.message));
                })
                .catch(function () {
                    return reply(Boom.badRequest('Requesting user is not an administrator of the group'));
                });
        }
    });

    server.route({
        path: '/groups/{id}/members',
        method: 'POST',
        config: {
            auth: true,
            validate: {
                params: {
                    id: Joi.number().integer().min(1),
                    adminName: Joi.string().min(1)
                }
            }
        },
        handler: function (request, reply) {
            Group.isMember(request.params.id, request.auth.credentials.username)
                .then(function () {
                    Group.addAdmin(request.params.id, request.params.adminName)
                        .then(function () {
                            reply("Administrator successfully added").code(200);
                        })
                        .catch(function () {
                            reply(Boom.badImplementation('Internal Server Error'));
                        });
                })
                .catch(Error, function (error) {
                    reply(Boom.badImplementation(error.message));
                })
                .catch(function () {
                    return reply(Boom.badRequest('Requesting user is not a member of the group'));
                });
        }
    });
};