'use strict';

var Catalog = require('../models/catalog.js'),
    Promise = require('bluebird'),
    Boom = require('boom'),
    redis = require('redis'),
    client = redis.createClient(),
    CronJob = require('cron').CronJob,
    moment = require('moment');

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
            Catalog.getTopRatedModelIdsRedis().then(function (result) {
                reply(result);
            }, function (error) {
                reply(Boom.badImplementation('Internal error: ' + error));
            });
        }
    });

    var generateCatalogLists = function () {
        Catalog.getTopRatedModelIds().then(function (result) {
            if (result.length == 0) {
                console.log('generateCatalogLists: empty result from getTopRatedModelIds');
                return;
            }

            result.unshift('topRated');

            client.del('topRated');
            client.send_command('rpush', result);
            client.set('topRatedTime', moment().utc().format("YYYY-MM-DD HH:mm").toString());
        }, function (error) {
            if (error) {
                console.log('generateCatalogLists-2: ' + JSON.stringify(error));
            }
        });
    };

    new CronJob('*/10 * * * * *', generateCatalogLists, null, true);
    generateCatalogLists();
};
