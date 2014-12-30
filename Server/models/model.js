var Promise = require('bluebird');
var db = require('../common/neo4jDatabase');
var model = {};

/**
 * Creates a model
 * @param {String} name Name of the model
 * @param {String} description Description of the model
 * @param {String} mainFilename Name of the main file (.obj or .stl)
 * @param {String} originalFilename Original name of the model folder
 * @param {String} mainfilePath Path of the model file in the server
 * @param {String} compressedFolderPath Path of the compressed folder for download
 * @param {String} uncompressedFolderPath Path of the uncompressed folder
 * @param {String} ownerName Name of the owner of the model
 * @param {String} thumbnail Url to thumbnail image
 */
model.create = function (name, description, mainFilename, originalFilename, mainfilePath, compressedFolderPath, uncompressedFolderPath, ownerName, thumbnail) {
    var query = [
        // get unique id
        'MERGE (id:UniqueId{name:\'Model\'})',
        'ON CREATE SET id.count = 1',
        'ON MATCH SET id.count = id.count + 1',
        'WITH id.count AS uid',
            'CREATE (m:Model{id:uid,name:{name}, thumbnail: {thumbnail}, originalFilename: {originalFilename}, description: {description}, ' +
            'mainFilename: {mainFilename}, filePath: {filePath}, compressedFolderPath: {compressedFolderPath}, uncompressedFolderPath: {uncompressedFolderPath}, publicationDate: {currentDate}})',
        'WITH m',
        'MATCH (user:User {username: {ownerName}})',
        'CREATE user-[:OWNS]->(m)',
        'RETURN m as model'
    ].join('\n');

    var timestamp = new Date();

    var params = {
        name: name,
        description: description,
        thumbnail: thumbnail,
        mainFilename: mainFilename,
        filePath: mainfilePath,
        compressedFolderPath: compressedFolderPath,
        uncompressedFolderPath: uncompressedFolderPath,
        ownerName: ownerName,
        currentDate: timestamp.toISOString(),
        originalFilename: originalFilename
    };

    return new Promise(function (resolve, reject) {
        db.query(query, params, function (error, results) {
            if (error) throw error;
            resolve(results[0]['model']['data']);
        });
    });
};

/**
 *
 * Returns a model by it's identifier
 *
 * @param {Number} id
 * @param {String} loggedUser username of the current autenticated user (if null, empty string will be used)
 * @returns {Promise} Returns a promise with the resolved model, rejects to error otherwise
 */
model.getById = function (id, loggedUser) {
    return new Promise(function (resolve, reject) {
        var query = [
            'MATCH (m:Model{id : {modelId}})<-[:OWNS]-(author)',
            'OPTIONAL MATCH m<-[c:COMMENTED]-(cAuthor)',
            'WITH * ORDER BY c.date DESC LIMIT 10',
            'WITH m, author, extract(c1 IN filter(c1 IN collect({c: c, author: cAuthor}) WHERE c1.c IS NOT NULL) | { date: c1.c.date, content: c1.c.content, author: c1.author.username, avatar: c1.author.avatar }) AS modelComments',
            'OPTIONAL MATCH m-[:TAGGED]->(modelTag:Tag)',
            'WITH m, author, modelComments, collect(modelTag.name) AS modelTags',
            'OPTIONAL MATCH (User)-[ru:VOTED {type: "UP"}]->m',
            'WITH m, author, modelComments, modelTags, count(ru) as modelUpvotes',
            'OPTIONAL MATCH (User)-[rd:VOTED {type: "DOWN"}]->m',
                'WITH m, author, { id: m.id, name: m.name, thumbnail: m.thumbnail, description: m.description, ' +
                'mainFilename: m.mainFilename, filePath: m.filePath, uncompressedFolderPath: m.uncompressedFolderPath, compressedFolderPath: m.compressedFolderPath, ' +
                'originalFilename: m.originalFilename, downvotes: count(rd), upvotes: modelUpvotes, publicationDate: m.publicationDate, ' +
                'isPublic: m.isPublic, tags: modelTags, author: { name: author.username, avatar: author.avatar, about: author.about }, ' +
                'comments:  modelComments, tags: modelTags} AS model',
            'OPTIONAL MATCH (u:User{username: {username}})',
            'WITH m, u, author, model',
            'OPTIONAL MATCH (u)-[v:VOTED]->(m)',
            'WITH m, u, author, model, v.type as uservote',
            'OPTIONAL MATCH (u)-[f:FAVOURITED]->(m)',
            'WITH m, model, u, author, uservote, (f IS NOT NULL ) as favourited',
            'OPTIONAL MATCH (u)-[fol:FOLLOWING]->(author)',
            'WITH m, model, u, author, uservote, favourited, (fol IS NOT NULL) as followingAuthor',
            'OPTIONAL MATCH (u)-[owns:OWNS]->(m)',
            'RETURN model, uservote, favourited, followingAuthor, (owns IS NOT NULL) as ownsModel'
        ].join('\n');

        var params = {
            modelId: Number(id),
            username: loggedUser
        };

        db.query(query, params, function (err, results) {
            if (err) return reject(err);
            return resolve(results);
        });
    });
};

/**
 *
 * Deletes a model
 * @param {Number} id
 * @returns {Promise} Returns a promise that resolves to true if successful, rejects otherwise
 */
model.deleteById = function (id) {
    return new Promise(function (resolve, reject) {
        var query = [
            'MATCH (m:Model {id: {modelId}})-[r]-()',
            'DELETE m, r'
        ].join('\n');

        var params = {
            modelId: Number(id)
        };

        db.query(query, params, function (err) {
            if (err) return reject(err);
            return resolve(true);
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
    return new Promise(function (resolve, reject) {
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
            'RETURN { id: m.id, name: m.name, description: m.description, files: m.files, downvotes: modelDownvotes, upvotes: modelUpvotes, publicationDate: m.publicationDate, visibility: m.visibility, tags: modelTags, author: { name: author.name, avatar: author.avatar, about: author.about }, comments:  modelComments, tags: modelTags} AS model'
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
    return new Promise(function (resolve, reject) {
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
 *
 * Removes a comment from a specified model
 * @param modelId id of the model
 * @param username username of the comment's author
 * @param date date of the comment
 * @returns {Promise} Returns a promise which resolves to true, rejects to error otherwise
 *
 */
model.removeComment = function (modelId, username, date) {
    return new Promise(function (resolve, reject) {
        var query = [
            'MATCH (u:User {username: {username}})-[c:COMMENTED {date: {date}}]->(m:Model {id: {modelId}})',
            'DELETE c'
        ].join('\n');

        var params = {
            modelId: modelId,
            username: username,
            date: date
        };

        db.query(query, params, function (err, results) {
            if (err) return reject(err);
            return resolve(true); //todo (possibly) return something based on whether the match worked or not
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
    return new Promise(function (resolve, reject) {
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

/**
 *
 * Adds a vote to a specified model
 * @param modelId id of the model
 * @param username username of the comment's author
 * @param vote vote type
 * @returns {Promise} Returns a promise with the created vote, rejects to error otherwise
 *
 */
model.addVote = function (modelId, username, vote) {
    return new Promise(function (resolve, reject) {
        var query = [
            'MATCH (u:User {username: {username}}), (m:Model {id: {id}})',
            'MERGE (u)-[v:VOTED]->(m)',
            'SET v.type = {vote}',
            'RETURN v'
        ].join('\n');

        var params = {
            id: modelId,
            username: username,
            vote: vote
        };

        db.query(query, params, function (err, results) {
            if (err) return reject(err);
            return resolve(results[0]);
        });
    });
};

/**
 *
 * Removes a vote from a specified model
 * @param modelId id of the model
 * @param username username of the comment's author
 * @returns {Promise} Returns a promise which resolves to true, rejects to error otherwise
 *
 */
model.deleteVote = function (modelId, username) {
    return new Promise(function (resolve, reject) {
        var query = [
            'MATCH (u:User {username: {username}})-[v:VOTED]->(m:Model {id: {id}})',
            'DELETE v'
        ].join('\n');

        var params = {
            id: modelId,
            username: username
        };

        db.query(query, params, function (err, results) {
            if (err) return reject(err);
            return resolve(true); //todo (possibly) return something based on whether the match worked or not
        });
    });
};

/**
 * Adds a tag to a model
 *
 * @param {Number} modelId Id of the model to be tagged
 * @param {String} tag Tag name
 * @returns {Promise} Resolves to true if successful, rejects otherwise
 */
model.addTag = function (modelId, tag) {
    return new Promise(function (resolve, reject) {
        var query = [
            'MATCH (model:Model {id: {id}})',
            'MERGE (tag:Tag {name: {tagName}})',
            'CREATE (model)-[:TAGGED]->(tag)'
        ].join('\n');

        var params = {
            id: Number(modelId),
            tagName: tag
        };

        db.query(query, params, function (err) {
            if (err) throw err;
            return resolve(true);
        });
    });
};

/**
 * Replace the tags of a models by the ones given as a parameter
 *
 * @param {Number} modelId Id of the model to be tagged
 * @param {Array<String>} tags Tag names
 * @returns {Promise} Resolves to true if successful, rejects otherwise
 */
model.replaceTags = function (modelId, tags) {
    return new Promise(function (resolve, reject) {
        var tagsClause = '[';
        for (var i = 0; i < tags.length; ++i) {
            tagsClause += ('"' + tags[i] + '"');
            if (i < (tags.length - 1)) // last element is not separated by a comma
                tagsClause += ', '
        }
        tagsClause += ']';

        var query = [
            'MATCH (m: Model { id: {id}})',
            'OPTIONAL MATCH (m)-[tg:TAGGED]->(t)',
                'WHERE NOT t.name IN ' + tagsClause,
            'DELETE tg',
                'FOREACH (tagName IN ' + tagsClause + ' |',
            'MERGE (tag:Tag{name: tagName})',
            'MERGE m-[:TAGGED]->tag',
            ')'
        ].join('\n');

        var params = {
            id: Number(modelId)
        };

        db.query(query, params, function (err) {
            if (err) throw err;
            return resolve(true);
        });
    });
};

/**
 * Removes a specific tag from a model
 *
 * @param {Number} modelId Id of the model whose tag will be removed
 * @param {String} tag Tag name
 * @returns {Promise} Resolves to true if successful, rejects otherwise
 */
model.removeTag = function (modelId, tag) {
    return new Promise(function (resolve, reject) {
        var query = [
            'MATCH (model:Model {id: {id}})-[relation:TAGGED]->(tag:Tag {name: {tagName}})',
            'DELETE relation'
        ].join('\n');

        var params = {
            id: Number(modelId),
            tagName: tag
        };

        db.query(query, params, function (err) {
            if (err) throw err;
            return resolve(true);
        });
    });
};

/**
 * Removes all tags from a model
 *
 * @param {Number} modelId Id of the model
 * @returns {Promise} Resolves to true if successful, rejects otherwise
 */
model.removeAllTags = function (modelId) {
    return new Promise(function (resolve, reject) {
        var query = [
            'MATCH (model:Model {id: {id}})-[relations:TAGGED]->(:Tag)',
            'DELETE relations'
        ].join('\n');

        var params = {
            id: Number(modelId)
        };

        db.query(query, params, function (err) {
            if (err) throw err;
            return resolve(true);
        });
    });
};

/**
 * Updates a model's information
 * @param {Number} modelId Id of the model to be updated
 * @param {String} description Model description
 * @param {Boolean} isPublic Model visibility
 * @param {Array<String>} tags Model tags
 * @returns {Promise} Resolves to the model is successful, rejects otherwise
 */
model.updateById = function (modelId, description, isPublic, tags) {
    return new Promise(function (resolve, reject) {
        var query = [
            'MATCH (model:Model {id: {id}})',
            'SET model.description = {description}, model.isPublic = {isPublic}',
            'WITH model',
            'OPTIONAL MATCH (model)-[:TAGGED]->(modelTag:Tag)',
            'WITH {id: model.id, name: model.name, description: model.description, isPublic: model.isPublic, tags: collect(modelTag.name)} as modelInfo',
            'RETURN modelInfo'
        ].join('\n');

        var params = {
            id: Number(modelId),
            description: description,
            isPublic: isPublic
        };

        model.replaceTags(modelId, tags)
            .then(function () {
                db.query(query, params, function (err, results) {
                    if (err) throw err;
                    return resolve(results[0]['modelInfo']);
                });
            })
            .catch(function (err) {
                return reject(err);
            });
    });
};

model.getPublishedGalleries = function (modelId) {
    return new Promise(function (resolve) {
        var query = [
            'MATCH (model:Model {id: {modelId}})',
            'OPTIONAL MATCH (gallery:Gallery)<-[published:PUBLISHED_IN]-(model)',
            'RETURN collect({name: gallery.name, '
        ].join('\n');

        var params = {
            modelId: modelId,

        };
    });
};
module.exports = model;
