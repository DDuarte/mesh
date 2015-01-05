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
 * Fetches relevant models older than a given date
 *
 * @param startdate
 * @returns {Promise} returns resolved content, rejects to error otherwise
 */
catalog.getRelevantModelsOlderThan = function (startdate, username) {
    return new Promise ( function (resolve, reject) {
        var query = [
            'MATCH (m:Model)',
            startdate ? 'WHERE m.publicationDate < {date}' : '',
            'OPTIONAL MATCH (m)-[r1:TAGGED]->(t)<-[r2:INTERESTED]-(u:User {username: {username}})',
            'WITH m, count(t) AS commonTags',
            'OPTIONAL MATCH (m:Model)<-[r3:OWNS]-(a:User)<-[r4:FOLLOWING]-(u:User {username: {username}})',
            'WITH m, commonTags, count(a) AS followedUsers',
            'WHERE commonTags > 0 OR followedUsers > 0',
            'WITH m ORDER BY m.publicationDate DESC LIMIT 20',
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
            date: startdate,
            username: username
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

 */

/**
 * Fetches models ids ordered by score relevance from the _database_
 *
 * @returns {Promise} returns resolved content, rejects to error otherwise
 */
catalog.getMostRelevantModelIds = function () {
    return new Promise(function (resolve, reject) {
        var query = [
            'MATCH (m:Model)',
            'OPTIONAL MATCH (User)-[ru:VOTED {type: "UP"}]->m',
            'WITH m, count(ru) as modelUpvotes',
            'OPTIONAL MATCH (User)-[rd:VOTED {type: "DOWN"}]->m',
            'WITH m, modelUpvotes, count(rd) as modelDownvotes',
            'RETURN collect({ id: m.id, publicationDate: m.publicationDate, up: modelUpvotes, down: modelDownvotes }) as models'
        ].join('\n');

        db.neo4j.query(query, {}, function (err, results) {
            if (err) return reject(err);
            var models = results[0] ? results[0].models : results;
            for (var i = 0; i < models.length; ++i) {
                var ts = new Date(models[i].publicationDate).getTime() / 1000 - 1134028003;
                var x = models[i].up - models[i].down;
                var y = x > 0 ? 1 : x == 0 ? 0 : -1;
                var z = Math.max(1, Math.abs(x));
                models[i].score = Math.log(z) / Math.LN10 + (y * ts) / 45000;
            }

            models.sort(function (model1, model2) {
                return model1.score < model2.score ? -1 : model1.score > model2.score ? 1 : 0;
            });

            return resolve(models.map(function (model) { return model.id; }));
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

/**
 * Fetches models ids ordered by relevance from _Redis_
 *
 * @returns {Promise} returns resolved content, rejects to error otherwise
 */
catalog.getMostRelevantModelIdsRedis = function () {
    return new Promise(function (resolve, reject) {
        db.redis.lrange('mostRelevant', 0, 100, function (err, reply) {
            if (err) return  reject(err);
            return resolve(reply.map(function (e) { return parseInt(e); }));
        });
    });
};

module.exports = catalog;
