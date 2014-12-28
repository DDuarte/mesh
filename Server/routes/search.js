'use strict';

var Promise = require('bluebird');
var Group = require('../models/group');
var Model = require('../models/model');
var User = require('../models/user');

module.exports = function (server) {
    server.route({
        method: 'GET',
        path: '/search/{term}',
        config: {
            auth: 'token'
        },
        handler: function (request, reply) {
            var term = request.params.term;
            Promise.join(Model.searchByName(term), Group.getByName(term), User.getByUsername(term),
                function (models, groups, users) {
                    return reply({
                        models: models,
                        groups: groups,
                        users: users
                    });
                });
        }
    })
};