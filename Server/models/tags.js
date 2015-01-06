'use strict';

var Promise = require('bluebird'),
    db = require('../common/db'),
    tag = {};

/**
 * Gets all tags ordered by their usage
 *
 * @returns {Promise} Returns a promise with the resolved list of tags, ordered by usage, rejects to error otherwise
 */
tag.getMostUsed = function () {
    return new Promise(function (resolve, reject) {
        var query = [
            'MATCH (t:Tag)',
            'OPTIONAL MATCH (t)<-[r]-(n)',
            'WITH {tag: t.name, uses: count(r)} as tags ORDER BY tags.uses DESC',
            'RETURN collect(tags.tag) as tags;'
        ].join('\n');

        db.neo4j.query(query, null, function (err, results) {
            if (err) return reject(err);
            return resolve(results[0].tags);
        });
    });
};

module.exports = tag;
