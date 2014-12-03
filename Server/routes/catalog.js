'use strict';

var Catalog = require('../models/catalog.js');
var Promise = require('bluebird');
var Boom = require('boom');

var schema = require('../schema');

module.exports = function (server) {

    server.route({
        method: 'GET',
        path: '/catalog/newest',
        config: {
            validate: {
                query: {
                    startdate: schema.model.date.optional()
                }
            }
        },
        handler: function (request, reply) {
            Catalog.getModelsOlderThan(request.query.startdate).then(function (result) {
                reply(result);
            }, function (error) {
                reply(Boom.badImplementation('Internal error: ' + error));
            });
        }
    });
};