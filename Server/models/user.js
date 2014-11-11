var Promise = require('bluebird');
var neo4j = require('neo4j');
var db = new neo4j.GraphDatabase(
        process.env['NEO4J_URL'] ||
        process.env['GRAPHENEDB_URL'] ||
        'http://localhost:7474'
);
var crypto = require('crypto');

var user = {};

/**
 *
 * Returns a model by it's name
 * @param username string identifier of the user
 * @returns {Promise} Returns a promise with the resolved user, rejects to error otherwise
 *
 */
user.getByUsername = function (username) {
    return new Promise ( function (resolve, reject) {
        var query = [
            'MATCH (u: User{username: { username }})',
            'RETURN { username: u.username, passwordHash: u.passwordHash, name: u.name, avatar: u.avatar } as user'
        ].join('\n');

        var params = {
            username: username
        };

        db.query(query, params, function (err, results) {
            if (err) return reject(err);
            return resolve(results);
        });
    });
};

user.generatePasswordHash = function (username, password) {
    var hasher = crypto.createHash('sha256');
    hasher.update(username + '+' + password);
    return hasher.digest('hex');
};

module.exports = user;