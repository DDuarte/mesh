'use strict';

var Model = require('../models/model');
var Promise = require('bluebird');
var neo4j = require('neo4j');
var client = require('../common/redisClient');
var Joi = require('joi');
var db = new neo4j.GraphDatabase(
    process.env['NEO4J_URL'] ||
    process.env['GRAPHENEDB_URL'] ||
    'http://localhost:7474'
);

module.exports = function (server) {

    server.route({
        method: 'GET',
        path: '/users/{id}',
        handler: function (request, reply) {
            var id = request.params.id;

            client.incr(id + '_counter', function (err, counter) {
                reply({
                    'id': id,
                    'counter': counter
                });
            });
        }
    });

};