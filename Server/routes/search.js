'use strict';

var Promise = require('bluebird'),
    Group = require('../models/group'),
    Model = require('../models/model'),
    User = require('../models/user'),
    Boom = require('boom');

module.exports = function (server) {
    server.route({
        method: 'GET',
        path: '/search/{term}',
        config: {
            auth: 'token'
        },
        handler: function (request, reply) {
            var term = ".*" + request.params.term.trim().replace(' ', '.*') + ".*";
            Promise.join(Model.searchByName(term), Group.searchByName(term), User.searchByUsername(term),
                function (models, groups, users) {
                    console.log("here");
                    console.log("models", models);
                    return reply({
                        models: models,
                        groups: groups,
                        users: users
                    });
                })
                .catch(function(error) {
                    console.log("Error:", error);
                    return reply(Boom.badImplementation('Internal server error'));
                });
        }
    })
};