var Promise = require('bluebird');
var db = require('../common/neo4jDatabase');
var catalog = {};


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

        db.query(query, params, function (err, results) {
            if (err) return reject(err);
            return resolve(results[0] ? results[0].models : results);
        });
    });
};

module.exports = catalog;