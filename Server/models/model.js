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
            'OPTIONAL MATCH m<-[c:COMMENTED]-(cAuthor)',
            'WITH * ORDER BY c.date DESC LIMIT 10',
            'WITH m, author, extract(c1 IN filter(c1 IN collect({c: c, author: cAuthor}) WHERE c1.c IS NOT NULL) | { date: c1.c.date, content: c1.c.content, author: c1.author.username, avatar: c1.author.avatar }) AS modelComments',
            'OPTIONAL MATCH m-[:TAGGED]->(modelTag:Tag)',
            'WITH m, author, modelComments, collect(modelTag.name) AS modelTags',
            'OPTIONAL MATCH (u:User)-[ru:VOTED {type: "UP"}]->m',
            'WITH m, author, modelComments, modelTags, count(ru) as modelUpvotes',
            'OPTIONAL MATCH (u:User)-[rd:VOTED {type: "DOWN"}]->m',
            'WITH m, author, modelComments, modelTags, modelUpvotes, count(rd) as modelDownvotes',
            'RETURN { name: m.name, description: m.description, files: m.files, downvotes: modelDownvotes, upvotes: modelUpvotes, publicationDate: m.publicationDate, visibility: m.visibility, tags: modelTags, author: { name: author.name, avatar: author.avatar, about: author.about }, comments:  modelComments, tags: modelTags} AS model'
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
            'MATCH (m:Model{name : {modelName}})<-[:OWNS]-(author)',
            'OPTIONAL MATCH m<-[c:COMMENTED]-(cAuthor)',
            'WITH * ORDER BY c.date DESC LIMIT 10',
            'WITH m, author, extract(c1 IN filter(c1 IN collect({c: c, author: cAuthor}) WHERE c1.c IS NOT NULL) | { date: c1.c.date, content: c1.c.content, author: c1.author.username, avatar: c1.author.avatar }) AS modelComments',
            'OPTIONAL MATCH m-[:TAGGED]->(modelTag:Tag)',
            'WITH m, author, modelComments, collect(modelTag.name) AS modelTags',
            'OPTIONAL MATCH (u:User)-[ru:VOTED {type: "UP"}]->m',
            'WITH m, author, modelComments, modelTags, count(ru) as modelUpvotes',
            'OPTIONAL MATCH (u:User)-[rd:VOTED {type: "DOWN"}]->m',
            'WITH m, author, modelComments, modelTags, modelUpvotes, count(rd) as modelDownvotes',
            'RETURN { name: m.name, description: m.description, files: m.files, downvotes: modelDownvotes, upvotes: modelUpvotes, publicationDate: m.publicationDate, visibility: m.visibility, tags: modelTags, author: { name: author.name, avatar: author.avatar, about: author.about }, comments:  modelComments, tags: modelTags} AS model'
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

/**
 *
 * Adds a comment to a specified model
 * @param modelId id of the model
 * @param username username of the comment's author
 * @param content text content for the comment
 * @returns {Promise} Returns a promise with the created content, rejects to error otherwise
 *
 */
model.addComment = function (modelId, username, content) {
    return new Promise ( function (resolve, reject) {
        var query = [
            'MATCH (u:User {username:{author}}), (m:Model {id:{id}})',
            'CREATE (u)-[c:COMMENTED {date:{date}, content:{comment}}]->(m)',
            'RETURN { date: c.date, content: c.content, author: u.username, avatar: u.avatar } as comment'
        ].join('\n');

        var timeStamp = new Date();

        var params = {
            id: modelId,
            author: username,
            comment: content,
            date: timeStamp.toISOString()
        };

        db.query(query, params, function (err, results) {
            if (err) return reject(err);
            return resolve(results[0] ? results[0].comment : results);
        });
    });
};

/**
 * Fetches a model's comments older than a given date
 *
 * @param modelId
 * @param startdate
 * @returns {Promise} returns resolved content, rejects to error otherwise
 */
model.getCommentsOlderThan = function (modelId, startdate) {
    return new Promise ( function (resolve, reject) {
        var query = [
            'MATCH (u:User)-[c:COMMENTED]->(m:Model {id: {id}})',
            startdate ? 'WHERE c.date < {date}' : '',
            'WITH * ORDER BY c.date DESC LIMIT 10',
            'RETURN collect({ date: c.date, content: c.content, author: u.username, avatar: u.avatar }) as comments'
        ].join('\n');

        var params = {
            id: modelId,
            date: startdate
        };

        db.query(query, params, function (err, results) {
            if (err) return reject(err);
            return resolve(results[0] ? results[0].comments : results);
        });
    });
};

module.exports = model;