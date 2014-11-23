var Joi = require('joi');
var Promise = require('bluebird');
var neo4j = require('neo4j');
var db = new neo4j.GraphDatabase(
        process.env['NEO4J_URL'] ||
        process.env['GRAPHENEDB_URL'] ||
        'http://localhost:7474'
);

var User = require('../models/user');
var Model = require('../models/model');
var Global = require('../models/global');

module.exports = function (server) {
    server.route({
        path: '/search',
        config: {
            validate: {
                query: {
                    term: Joi.string().required().max(50),
                    type: Joi.string().required(),
                    per_page: Joi.number().integer().required(),
                    page: Joi.number().integer().required()
                }
            }
        },
        handler: function (request, reply) {

        }
    })
};