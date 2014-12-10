'use strict';

var Catalog = require('../models/catalog.js'),
    Promise = require('bluebird'),
    Boom = require('boom'),
    redis = require('redis'),
    client = redis.createClient(),
    CronJob = require('cron').CronJob;

var schema = require('../schema');

module.exports = function (server) {

    server.route({
        method: 'GET',
        path: '/catalog/newest',
        config: {
            validate: {
                query: {
                    startDate: schema.model.date.optional()
                }
            }
        },
        handler: function (request, reply) {
            Catalog.getModelsOlderThan(request.query.startDate).then(function (result) {
                reply(result);
            }, function (error) {
                reply(Boom.badImplementation('Internal error: ' + error));
            });
        }
    });

    server.route({
        method: 'GET',
        path: '/catalog/topRated',
        handler: function (request, reply) {
            Catalog.getTopRatedModelIds().then(function (result) {
                reply(result);
            }, function (error) {
                reply(Boom.badImplementation('Internal error: ' + error));
            });
        }
    });

    var generateCatalogLists = function () {

    };

    new CronJob('*/10 * * * * *', generateCatalogLists, null, true);
    generateCatalogLists();
};
