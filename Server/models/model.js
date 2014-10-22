var Promise = require('bluebird');
var neo4j = require('neo4j');
var db = new neo4j.GraphDatabase(
        process.env['NEO4J_URL'] ||
        process.env['GRAPHENEDB_URL'] ||
        'http://localhost:7474'
);

var model = {};
/**
 *
 * Returns a model by it's identifier
 * @param {Number} id
 *
 */
model.getById = function (id) {
    return new Promise( function (resolve, reject) {
        var query = [
            'MATCH (m:Model{id : {modelId}})<-[:OWNS]-(author)',
            'MATCH m<-[c:COMMENTED]-(cAuthor)',
            'WITH *',
            'ORDER BY c.date DESC LIMIT 10',
            'RETURN { name: m.name, description: m.description, files: m.files, downVotes: m.downvotes, upVotes: m.upvotes, publicationDate: m.publicationDate, visibility: m.visibility, tags: m.tags, author: { name: author.name, avatar: author.avatar, about: author.about }, comments: collect({ date: c.date, content: c.content, author: cAuthor.name, avatar: cAuthor.avatar }) } as model'
        ].join('\n');

        var params = {
            modelId: Number(id)
        };

        db.query(query, params, function (err, results) {
            if (err) return reject(err);
            return resolve(results);
        });
    });
};

/**
 *
 * Returns a model by it's name
 * @param name
 * @returns {Promise} Returns a promise with the resolved model, rejects to error otherwise
 *
 */
model.getByName = function (name) {
    return new Promise ( function (resolve, reject) {
        var query = [
            'MATCH (m:Model{name: {modelName}})<-[:OWNS]-(author)',
            'MATCH m<-[c:COMMENTED]-(cAuthor)',
            'WITH *',
            'ORDER BY c.date DESC LIMIT 10',
            'RETURN {name: m.name, description: m.description, files: m.files, downVotes: m.downvotes, upVotes: m.upvotes, publicationDate: m.publicationDate, visibility: m..visibility, tags: m.tags, author: { name: author.name, avatar: author.avatar, about: author.about }, comments: collect({ date: c.date, content: c.content, author: cAuthor.name, avatar: cAuthor.avatar }) } as model'
        ].join('\n');

        var params = {
            modelName: name
        };

        db.query(query, params, function (err, results) {
            if (err) return reject(err);
            return resolve(results);
        });
    });
};

module.exports = model;