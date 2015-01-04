'use strict';

var Promise = require('bluebird'),
    db = require('../common/db'),
    catalog = {};

/**
 * Fetches models older than a given date
 *
 * @param startdate
 * @returns {Promise} returns resolved content, rejects to error otherwise
 */
catalog.getModelsOlderThan = function (startdate) {
    return new Promise ( function (resolve, reject) {
        var query = [
            'MATCH (m:Model)',
            startdate ? 'WHERE m.publicationDate < {date}' : '',
            'WITH * ORDER BY m.publicationDate DESC LIMIT 20',
            'MATCH (m)<-[:OWNS]-(author:User)',
            'OPTIONAL MATCH (User)-[ru:VOTED {type: "UP"}]->m',
            'WITH m, author, count(ru) as upvotes',
            'OPTIONAL MATCH (User)-[rd:VOTED {type: "DOWN"}]->m',
            'WITH m, author, upvotes, count(rd) as downvotes',
            'OPTIONAL MATCH (User)-[cm:COMMENTED]->m',
            'WITH m, author, upvotes, downvotes, count(cm) as comments ORDER BY m.publicationDate DESC',
            'RETURN collect({ modelId: m.id, title: m.name, thumbnail: m.thumbnail, author: author.username, authorAvatar: author.avatar, date: m.publicationDate, numComments: comments, upvotes: upvotes, downvotes: downvotes}) as models'
        ].join('\n');

        var params = {
            date: startdate
        };

        db.neo4j.query(query, params, function (err, results) {
            if (err) return reject(err);
            return resolve(results[0] ? results[0].models : results);
        });
    });
};

/**
 * Fetches models ids ordered by score (upvotes - downvotes) from the _database_
 *
 * @returns {Promise} returns resolved content, rejects to error otherwise
 */
catalog.getTopRatedModelIds = function () {
    return new Promise(function (resolve, reject) {
        var query = [
            'MATCH (m: Model)',
            'OPTIONAL MATCH m<-[ru: VOTED {type: "UP"}]-u',
            'WITH m, count(ru) as modelUpvotes',
            'OPTIONAL MATCH m<-[rd: VOTED {type: "DOWN"}]-u',
            'WITH m, modelUpvotes, count(rd) as modelDownvotes',
            'WITH * ORDER BY (modelUpvotes - modelDownvotes) DESC',
            'RETURN collect(m.id) as models'
        ].join('\n');

        db.neo4j.query(query, {}, function (err, results) {
            if (err) return reject(err);
            return resolve(results[0] ? results[0].models : results);
        });
    });
};

/**
 * Fetches models ids ordered by score (upvotes - downvotes) from _Redis_
 *
 * @returns {Promise} returns resolved content, rejects to error otherwise
 */
catalog.getTopRatedModelIdsRedis = function () {
    return new Promise(function (resolve, reject) {
        db.redis.lrange('topRated', 0, 100, function (err, reply) {
            if (err) return  reject(err);
            return resolve(reply.map(function (e) { return parseInt(e); }));
        });
    });
};

module.exports = catalog;
