var Promise = require('bluebird'),
    db = require('../common/neo4jDatabase'),
    crypto = require('crypto');

var user = {};

/**
 *
 * Returns a user by it's name
 /**
 *
 * Returns a user by it's name
 * @param username string identifier of the user
 * @returns {Promise} Returns a promise with the resolved user, rejects to error otherwise
 *
 */
user.getByUsername = function (username) {
    return new Promise(function (resolve, reject) {
        var query = [
            'MATCH (u: User{username: { username }})',
            'with u',
            'OPTIONAL MATCH (u)-[:INTERESTED]->(userInterest:Tag)',
            'RETURN { firstName: u.firstName, passwordHash: u.passwordHash, lastName: u.lastName, username: u.username, avatar: u.avatar, email: u.email, active: u.active, about: u.about, interests: collect(userInterest.name) } as user'
        ].join('\n');

        var params = {
            username: username
        };

        db.query(query, params, function (err, results) {
            if (err) return reject(err);

            if (results.length > 0)
                return resolve(results[0]['user']);
            else
                return reject('No users were found');
        });
    });
};

/**
 *
 * Returns a user by it's email
 * @param {String} email String email identifier of the user
 * @returns {Promise} Returns a promise with the resolved user, rejects to error otherwise
 *
 */
user.getByEmail = function (email) {
    return new Promise(function (resolve, reject) {
        var query = [
            'MATCH (u:User {email: {email}})',
            'RETURN { username: u.username, passwordHash: u.passwordHash, name: u.name, avatar: u.avatar, email: u.email } as user '
        ].join('\n');

        var params = {
            email: email
        };

        db.query(query, params, function (err, results) {
            if (err) return reject(err);

            if (results.length > 0)
                return resolve(results);
            else
                return reject('No user was found');
        });
    });
};

user.getFollowers = function (username) {
    return new Promise(function (resolve, reject) {
        var query = [
            'MATCH (user:User{username: { username }})<-[:FOLLOWING]-(follower:User)',
            'RETURN collect({username: follower.username, avatar: follower.avatar, email: follower.email}) as followers'
        ].join('\n');

        var params = {
            username: username
        };

        db.query(query, params, function (err, results) {
            if (err) return reject(err);

            if (results.length > 0)
                return resolve(results[0]['followers']);
            else
                return reject('No users were found');
        });
    });
};

user.getFollowing = function (username) {
    return new Promise(function (resolve, reject) {
        var query = [
            'MATCH (user:User{username: { username }})-[:FOLLOWING]->(followed:User)',
            'RETURN collect({username: followed.username, avatar: followed.avatar, email: followed.email}) as following'
        ].join('\n');

        var params = {
            username: username
        };

        db.query(query, params, function (err, results) {
            if (err) return reject(err);

            if (results.length > 0)
                return resolve(results[0]['following']);
            else
                return reject('No users were found');
        });
    });
};

/**
 *
 * Creates a user based on the registerInfo
 * @param {Object} registerInfo Info to be inserted as the user's information
 * @returns {Promise} Returns a promise with the resolved user, rejects to error otherwise
 *
 */
user.create = function (registerInfo) {
    return new Promise(function (resolve, reject) {
        var query = [
            'CREATE (u: User{ lowerUsername: lower({ username }), firstName: { firstName }, lastName: { lastName }, username: { username }, email: { email }, passwordHash: { passwordHash }, birthdate: { birthdate }, avatar: { avatarUrl }, country: { country }, active: {active}}) RETURN u'
        ].join('\n');

        var params = {
            firstName: registerInfo.firstName,
            lastName: registerInfo.lastName,
            username: registerInfo.username,
            email: registerInfo.email,
            passwordHash: user.generatePasswordHash(registerInfo.username, registerInfo.password),
            birthdate: registerInfo.birthdate,
            country: registerInfo.country,
            active: registerInfo.active,
            avatarUrl: user.generateGravatarUrl(registerInfo.email)
        };

        db.query(query, params, function (err, results) {
            if (err) return reject(err);

            return resolve(results);
        });
    });
};

/**
 *
 * Adds a model to a user's favourites
 * @param username string identifier of the user
 * @param modelId identifier of the model
 * @returns {Promise} Returns a promise with the resolved user, rejects to error otherwise
 *
 */
user.addFavouriteModel = function (username, modelId) {
    return new Promise(function (resolve, reject) {
        var query = [
            'MATCH (u:User {username: {username}}), (m:Model {id: {id}})',
            'MERGE (u)-[f:FAVOURITED]->(m)',
            'RETURN f'
        ].join('\n');

        var params = {
            username: username,
            id: modelId
        };

        db.query(query, params, function (err, results) {
            if (err) return reject(err);
            return resolve(results[0]);
        });
    });
};

/**
 *
 * Removes a model from a user's favourites
 * @param username string identifier of the user
 * @param modelId identifier of the model
 * @returns {Promise} Returns a promise which resolves to true, rejects to error otherwise
 *
 */
user.removeFavouriteModel = function (username, modelId) {
    return new Promise(function (resolve, reject) {
        var query = [
            'MATCH (User {username: {username}})-[f:FAVOURITED]->(Model {id: {id}})',
            'DELETE f'
        ].join('\n');

        var params = {
            username: username,
            id: modelId
        };

        db.query(query, params, function (err, results) {
            if (err) return reject(err);
            return resolve(true); //todo (possibly) return something based on whether the match worked or not
        });
    });
};

/**
 *
 * Adds a user to another user's followers
 * @param follower string identifier of the user that wants to follow another user
 * @param followed string identifier of the user being followed
 * @returns {Promise} Returns a promise with the resolved user, rejects to error otherwise
 *
 */
user.followUser = function (follower, followed) {
    return new Promise(function (resolve, reject) {
        var query = [
            'MATCH (u:User {username: {follower}}), (u2:User {username: {followed}})',
            'MERGE (u)-[f:FOLLOWING]->(u2)',
            'RETURN f'
        ].join('\n');

        var params = {
            follower: follower,
            followed: followed
        };

        db.query(query, params, function (err, results) {
            if (err) return reject(err);
            return resolve(results[0]);
        });
    });
};

/**
 *
 * Adds a user to another user's followers
 * @param follower string identifier of the user that wants to follow another user
 * @param followed string identifier of the user being followed
 * @returns {Promise} Returns a promise which resolves to true, rejects to error otherwise
 *
 */
user.unfollowUser = function (follower, followed) {
    return new Promise(function (resolve, reject) {
        var query = [
            'MATCH (a:User {username: {follower}})-[f:FOLLOWING]->(b:User {username: {followed}})',
            'DELETE f'
        ].join('\n');

        var params = {
            follower: follower,
            followed: followed
        };

        db.query(query, params, function (err, results) {
            if (err) return reject(err);
            return resolve(true); //todo (possibly) return something based on whether the match worked or not
        });
    });
};

/**
 *
 * Activates a user account
 * @param {String} username User identifier
 * @return {Promise} Resolved if the user exists, rejected otherwise
 *
 */
user.activate = function (username) {
    return new Promise(function (resolve, reject) {
        var query = [
            'MATCH (u:User {username: {username}})',
            'SET u.active = true'
        ].join('\n');

        var params = {
            username: username
        };

        db.query(query, params, function (err, results) {
            if (err) return reject(err);
            return resolve(true);
        });
    });
};

/**
 *
 * Changes password of a user account
 * @param {String} username User identifier
 * @param {String} newPassword New password
 * @return {Promise} Resolved if the user exists, rejected otherwise
 *
 */
user.changePassword = function (username, newPassword) {
    return new Promise(function (resolve, reject) {
        var query = [
            'MATCH (u:User {username: {username}})',
            'SET u.passwordHash = {passwordHash}'
        ].join('\n');

        var params = {
            username: username,
            passwordHash: user.generatePasswordHash(username, newPassword)
        };

        db.query(query, params, function (err, results) {
            if (err) return reject(err);
            return resolve(true);
        });
    });
};

/**
 * generates a gravatar URL from a user's email
 * @param email
 * @returns {String} gravatar URL
 */
user.generateGravatarUrl = function (email) {
    var hash = crypto.createHash('md5');
    hash.update(email);
    return 'http://www.gravatar.com/avatar/' + hash.digest('hex') + '?d=identicon';
};


/**
 *
 * Generates a password hash from a username and password
 * @param {String} username
 * @param {String} password
 * @returns {String} Hash of the username and password
 *
 */
user.generatePasswordHash = function (username, password) {
    var hash = crypto.createHash('sha256');
    hash.update(username + '+' + password);
    return hash.digest('hex');
};

/**
 *
 * Updates a user based on the registerInfo
 * @param {String} username User identifier
 * @param {Object} fields The user fields with respective values to update
 * @returns {Promise} Returns a promise with the updated user, rejects to error otherwise
 *
 */
user.update = function (username, fields) {
    return new Promise(function (resolve, reject) {
        var query = ['MATCH (u:User {username: {username}})',
            'SET ',
            'WITH u',
            'OPTIONAL MATCH (u)-[:INTERESTED]->(tag:Tag)',
            'RETURN {firstName: u.firstName, lastName: u.lastName, about: u.about, interests: collect(tag.name)} as userInfo'
        ];

        for (var field in fields) {
            query[1] += 'u.' + field + '={' + field + '},';
        }
        query[1] = query[1].substring(0, query[1].length - 1);

        query = query.join('\n');

        fields.username = username;

        db.query(query, fields, function (err, results) {
            if (err) return reject(err);
            return resolve(results);
        });
    });
};

/**
 * Returns all the owned models of a user
 * @param {String} username Username of the target user
 * @returns {Promise} Resolves to the owned models if successful, rejects otherwise
 */
user.getAllModels = function (username) {
    var query = [
        'MATCH (user:User {username: {name}})-[:OWNS]->(m:Model)',
        'WITH * ORDER BY m.publicationDate DESC',
        'OPTIONAL MATCH (User)-[ru:VOTED {type: "UP"}]->m',
        'WITH m, user, count(ru) as upvotes',
        'OPTIONAL MATCH (User)-[rd:VOTED {type: "DOWN"}]->m',
        'WITH m, user, upvotes, count(rd) as downvotes',
        'OPTIONAL MATCH (User)-[cm:COMMENTED]->m',
        'WITH m, user, upvotes, downvotes, count(cm) as comments ORDER BY m.publicationDate DESC',
        'RETURN collect({ modelId: m.id, title: m.name, thumbnail: m.thumbnail, author: user.username, authorAvatar: user.avatar, date: m.publicationDate, numComments: comments, upvotes: upvotes, downvotes: downvotes}) as models'
    ].join('\n');

    var params = {
        name: username
    };

    return new Promise(function (resolve, reject) {
        db.query(query, params, function (err, results) {
            if (err) return reject(err);
            return resolve(results[0] ? results[0].models : results);
        });
    });
};

/**
 * Adds an interest to a User
 * @param {String} username Username of the target user
 * @param {String} interest Name of the interest
 * @returns {Promise} Resolves to true if successful, rejects otherwise
 */
user.addInterest = function(username, interest) {
    return new Promise(function(resolve, reject) {
        var query = [
            'MATCH (user:User {username: {userName}})',
            'MERGE (tag:Tag {name: {interest}})',
            'CREATE (user)-[:INTERESTED]->(tag)'
        ].join('\n');

        var params = {
            userName: username,
            tagName: interest
        };

        db.query(query, params, function(err) {
            if (err) throw err;
            return resolve(true);
        });
    });
};

/**
 * Adds an interest to a User
 * @param {String} username Username of the target user
 * @param {String} interests Name of the interests
 * @returns {Promise} Resolves to true if successful, rejects otherwise
 */
user.replaceInterests = function(username, interests) {
    return new Promise(function(resolve) {
        var tagsClause = '[';
        for (var i = 0; i < interests.length; ++i) {
            tagsClause += ('"' + interests[i] + '"');
            if (i < (interests.length - 1)) // last element is not separated by a comma
                tagsClause += ', '
        }
        tagsClause += ']';

        var query = [
            'MATCH (u:User { username: {username}})',
            'OPTIONAL MATCH (u)-[tg:INTERESTED]->(t)',
                'WHERE NOT t.name IN ' + tagsClause,
            'DELETE tg',
                'FOREACH (tagName IN ' + tagsClause + ' |',
            'MERGE (tag:Tag{name: tagName})',
            'MERGE u-[:INTERESTED]->tag',
            ')'
        ].join('\n');

        var params = {
            username: username
        };

        db.query(query, params, function(err) {
            if (err) throw err;
            return resolve(true);
        });
    });
};

/**
 * Removes an interest from a User
 * @param {String} username Username of the target user
 * @param {String} interest Name of the interest to be removed
 * @returns {Promise} Resolves to true if successful, rejects otherwise
 */
user.removeInterest = function(username, interest) {
    return new Promise(function(resolve, reject) {
        var query = [
            'MATCH (user:User {username: {userName}})-[relation:INTERESTED]->(tag:Tag {name: {tagName}})',
            'DELETE relation'
        ].join('\n');

        var params = {
            userName: username,
            tagName: interest
        };

        db.query(query, params, function(err) {
            if (err) throw err;
            return resolve(true);
        });
    });
};

/**
 * Adds an interest to a User
 * @param {String} username Username of the target user
 * @returns {Promise} Resolves to true if successful, rejects otherwise
 */
user.removeAllInterests = function(username) {
    return new Promise(function(resolve, reject) {
        var query = [
            'MATCH (user:User {username: {userName}})-[relations:INTERESTED]->(:Tag)',
            'DELETE relations'
        ].join('\n');

        var params = {
            userName: username
        };

        db.query(query, params, function(err) {
            if (err) throw err;
            return resolve(true);
        });
    });
};

/**
 * Returns all the galleries owned by the user
 * @param {String} username Username of the user
 * @param {Boolean} isOwner true if the private galleries should be returned as well, false otherwise
 * @returns {Promise} Resolves to the galleries if successful, rejects otherwise
 */
user.getAllGalleries = function(username, isOwner) {
    return new Promise(function(resolve) {
        var query = [
            'MATCH (user:User {username: {username}})',
            'MATCH (user)-[:OWNS]-(gallery:Gallery' + (isOwner ? '' : '{isPublic: true}') + ')',
            'RETURN collect({name: gallery.name, isPublic: gallery.isPublic}) as galleries'
        ].join('\n');

        var params = {
            username: username
        };

        db.query(query, params, function(err, results) {
            if (err) throw err;
            return resolve(results[0] ? results[0].galleries: results);
        });
    });
};

/**
 * Checks whether a user already owns a gallery with the same name
 * @param {String} username Username of the target user
 * @param {String} galleryName Name of the target gallery
 * @returns {Promise} Resolves to true if gallery exists, false if it does not
 */
user.galleryExists = function(username, galleryName) {
    return new Promise(function(resolve) {
        var query = [
            'MATCH (user:User {username: {username}})',
            'MATCH (user)-[:OWNS]->(gallery:Gallery {name: {galleryName}})',
            'RETURN gallery'
        ].join('\n');

        var params = {
            username: username,
            galleryName: galleryName
        };

        db.query(query, params, function(err, results) {
            if (err) throw err;

            if (results.length > 0)
                return resolve(true);
            else
                return resolve(false);
        });
    });
};

/**
 * Returns the models of a gallery owned by a user
 * @param {String} username Username of the user
 * @param {String} galleryName Name of the target gallery
 * @returns {Promise} Resolves to the models if successful, rejects otherwise
 */
user.getGalleryModels = function(username, galleryName) {
    return new Promise(function(resolve, reject) {
        var query = [
            'MATCH (user:User {username: {username}})',
            'MATCH (user)-[:OWNS]->(gallery:Gallery {name: {galleryName}})',
            'MATCH (gallery)<-[:PUBLISHED_IN]-(models:Model)',
            'RETURN models'
        ].join('\n');

        var params = {
            username: username,
            galleryName: galleryName
        };

        db.query(query, params, function(err, results) {
            if (err) throw err;
            return resolve(results);
        });
    });
};

/**
 * Creates a user gallery
 * @param {String} username Username of the target user
 * @param {String} galleryName Name of the gallery to be created
 * @returns {Promise} Resolves to the gallery information if successful, rejects otherwise.
 */
user.createGallery = function (username, galleryName) {
    return new Promise(function(resolve) {
        var query = [
            'MATCH (user:User {username: {username}})',
            'CREATE (gallery:Gallery {name: {galleryName}})',
            'CREATE (user)-[:OWNS]->(gallery)',
            'RETURN {name: gallery.name, isPublic: gallery.isPublic} as galleryInfo'
        ].join('\n');

        var params = {
            username: username,
            galleryName: galleryName
        };

        db.query(query, params, function(err, results) {
            if (err) throw err;
            return resolve(results[0]['galleryInfo']);
        });
    });
};

/**
 * Updates a user gallery
 * @param {String} username Username of the target user
 * @param {String} galleryName Name of the gallery to be created
 * @param {Boolean} isPublic New gallery visibility
 * @returns {Promise} Resolves to the gallery information if successful, rejects otherwise.
 */
user.updateGallery = function (username, galleryName, isPublic) {
    return new Promise(function(resolve) {
        var query = [
            'MATCH (user:User {username: {username}})-[:OWNS]->(gallery:Gallery {name: {galleryName}})',
            'SET gallery.isPublic = {isPublic}',
            'RETURN {name: gallery.name, isPublic: gallery.isPublic} as galleryInfo'
        ].join('\n');

        var params = {
            username: username,
            galleryName: galleryName,
            isPublic: isPublic
        };

        db.query(query, params, function(err, results) {
            if (err) throw err;
            return resolve(results[0]['galleryInfo']);
        });
    });
};

/**
 * Deletes a user gallery
 * @param {String} username Username of the target user
 * @param {String} galleryName Name of the gallery to be deleted
 * @returns {Promise} Resolves to true if successful, rejects otherwise.
 */
user.removeGallery = function (username, galleryName) {
    return new Promise(function(resolve) {
        var query = [
            'MATCH (user:User {username: {username}})',
            'MATCH (user)-[:OWNS]->(gallery:Gallery {name: {galleryName}})',
            'WITH gallery',
            'OPTIONAL MATCH (gallery)-[r]-()',
            'DELETE gallery, r'
        ].join('\n');

        var params = {
            username: username,
            galleryName: galleryName
        };

        db.query(query, params, function(err) {
            if (err) throw err;
            return resolve(true);
        });
    });
};

/**
 * Adds a model to a user's gallery
 * @param {String} username Username of the target user
 * @param {String} galleryName Name of the target gallery
 * @param {Number} modelId Id of the target model
 * @returns {Promise} Resolves to the gallery information if successful, rejects otherwise
 */
user.addModelToGallery = function(username, galleryName, modelId) {
    return new Promise(function(resolve, reject) {
        var query = [
            'MATCH (user:User {username: {username}})',
            'MATCH (user)-[:OWNS]->(gallery:Gallery {name: {galleryName}})',
            'MATCH (user)-[:OWNS]->(model:Model {id: {modelId}})',
            'CREATE (gallery)<-[:PUBLISHED_IN]-(model)',
            'RETURN gallery'
        ].join('\n');

        var params = {
            username: username,
            galleryName: galleryName,
            modelId: Number(modelId)
        };

        db.query(query, params, function(err, results) {
            if (err) throw err;
            resolve(results);
        });
    });
};

module.exports = user;
