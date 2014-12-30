var Promise = require('bluebird');
var db = require('../common/neo4jDatabase');

var group = {};

/**
 * Creates a new group
 * @param groupInfo Group information to be persisted in the database
 * @returns {Promise} Resolves to the group information if successful, rejects otherwise
 */
group.create = function(groupInfo) {
    var query = [
        'MATCH (user:User {username: {adminName}})',
        'CREATE (group:Group {name: {name}, lowerName: lower({ name }), description: {description}, creationDate: {creationDate}})',
        'WITH group, user',
        'CREATE (group)<-[:IS_ADMIN]-(user)',
        'RETURN group.name as name'
    ].join('\n');

    return new Promise (function (resolve) {
        db.query(query, groupInfo, function (err, results) {
            if (err) throw new Error('Internal database error');
            return resolve(results[0]);
        });
    })
};

/**
 * Returns a group identified by it's name
 * @param {String} name Name of the group
 * @returns {Promise} Resolves to the group if successful, rejects otherwise
 */
group.getByName = function (name) {
    var query = [
        'MATCH (g:Group {lowerName: lower({ name })})',
        'RETURN {name: g.name, description: g.description} as group'
    ].join('\n');

    var params = {
        name: name
    };

    return new Promise(function (resolve, reject) {
        db.query(query, params, function (err, results) {
            if (err) throw new Error('Internal database error');
            if (results.length > 0)
                return resolve(results[0]);
            else
                return reject(false);
        });
    });
};

/**
 * Returns a group by id
 * @param {String} id Identifier of the group
 * @returns {Promise} Resolves to the group if successful, rejects otherwise
 */
group.getById = function (id) {
    var query = [
        'MATCH (group:Group)',
        'WHERE id(group) = {id}',
        'RETURN group'
    ].join('\n');

    var params = {
        id: Number(id)
    };

    return new Promise(function (resolve, reject) {
        db.query(query, params, function (err, results) {
            if (err) throw new Error('Internal database error');

            if (results.length > 0)
                return resolve(results[0]);
            else
                return reject(false);
        });
    });
};

/**
 * Checks whether a user is te admnistrator of a given group
 * @param {String} groupName Name of the group
 * @param {String} userName Name of the user
 * @returns {Promise} Resolves to true if the user is the administrator, rejects otherwise
 */
group.isAdmin = function(groupName, userName) {
    var query = [
        'MATCH (group:group {name: {groupName})<-[:IS_ADMIN]-(user:User {name: {userName}})',
        'RETURN user'
    ].join('\n');

    var params = {
        groupName: groupName,
        userName: userName
    };

    return new Promise (function(resolve, reject) {
        db.query(query, params, function(err, results) {
            if (err) throw new Error('Internal database error');

            if (results.length > 0)
                return resolve(true);
            else
                return resolve(false);
        });
    });
};

/**
 * Checks whether a user is a member of a given group
 * @param {String} groupName Name of the group
 * @param {String} userName Name of the user
 * @returns {Promise} Resolves to true if the user if a member of the group, rejects otherwise
 */
group.isMember = function(groupName, userName) {
    var query = [
        'MATCH (group:group {name: {groupName})<-[:IS_MEMBER]-(user:User {name: {userName}})',
        'RETURN user'
    ].join('\n');

    var params = {
        groupName: groupName,
        userName: userName
    };

    return new Promise (function(resolve, reject) {
        db.query(query, params, function(err, results) {
            if (err) throw new Error('Internal database error');

            if (results.length > 0)
                return resolve(true);
            else
                return resolve(false);
        });
    });
};

/**
 * Adds a member to an existing group
 * @param {String} groupName Name of the group
 * @param {String} memberName Name of the user to be added to the group
 * @returns {Promise} Resolves to true if successful, rejects otherwise
 */
group.addMember = function (groupName, memberName) {
    var query = [
        'MATCH (group:Group {name: {groupName}})',
        'MATCH (user:User {name: {memberName})',
        'CREATE group<-[:IS_MEMBER]-user'
    ];

    var params = {
        groupName: groupName,
        memberName: memberName
    };

    return new Promise (function(resolve, reject) {
        db.query(query, params, function(err) {
            if (err) throw new Error('Internal Database error');
            return resolve(true);
        });
    });
};

/**
 * Adds an administrator to an existing group
 * @param {String} groupName Name of the group
 * @param {String} adminName Name of the user to be assigned as administrator of the group
 * @returns {Promise} Resolves to true if successful, rejects otherwise
 */
group.addAdmin = function (groupName, adminName) {
    var query = [
        'MATCH (group:Group {name: {groupName}})',
        'MATCH (user:User {name: {adminName}})',
        'CREATE group<-[:IS_ADMIN]-user'
    ].join('\n');

    var params = {
        groupName: groupName,
        adminName: adminName
    };

    return new Promise(function(resolve, reject) {
        db.query(query, params, function(err) {
            if (err) throw new Error('Internal database error');
            return resolve(true);
        });
    });
};

/**
 * Returns the group administrators
 * @param {String} groupId Id of the group
 * @returns {Promise} Resolves to the group administrators if successful, rejects otherwise
 */
group.getAdministrators = function (groupId) {
    var query = [
        'MATCH (group:Group)<-[:IS_ADMIN]-(admins:User)',
        'WHERE id(group) = {id}',
        'RETURN admins'
    ].join('\n');

    var params = {
        id: groupId
    };

    return new Promise(function(resolve, reject) {
        db.query(query, params, function(err, results) {
            if (err) throw new Error('Internal database error');
            return resolve(results);
        });
    });
};

/**
 * Returns the group members
 * @param {String} groupId Id of the group
 * @returns {Promise} Resolves to the group members if successful, rejects otherwise
 */
group.getMembers = function (groupId) {
    var query = [
        'MATCH (group:Group)<-[:IS_MEMBER]-(members:User)',
        'WHERE id(group) = {id}',
        'RETURN members'
    ].join('\n');

    var params = {
        id: groupId
    };

    return new Promise(function(resolve, reject) {
        db.query(query, params, function(err, results) {
            if (err) throw new Error('Internal database error');
            return resolve(results);
        });
    });
};

/**
 * Returns all the galleries of a group
 * @param {Integer} groupId Id of the group
 * @returns {Promise} Resolves to the group galleries if successful, throws an exception in case of a database error
 */
group.getAllGalleries = function(groupId) {
    var query = [
        'MATCH (group:Group)-[:OWNS]->(galleries:Gallery)',
        'WHERE id(group) = {id}',
        'RETURN galleries.name'
    ].join('\n');

    var params = {
        id: groupId
    };

    return new Promise(function(resolve, reject) {
        db.query(query, params, function(err, results) {
            if (err) throw new Error('Internal database error');
            return resolve(results);
        });
    })
};

/**
 * Returns all the public galleries of a group
 * @param {Integer} groupId Id of the given group
 * @returns {Promise} Resolves to the galleries if successful, throws exception in case of database error
 */
group.getPublicGalleries = function(groupId) {
    var query = [
        'MATCH (group:Group)-[:OWNS]->(galleries:Gallery {public: true})',
        'WHERE id(group) = {id}',
        'RETURN galleries.name'
    ].join('\n');

    var params = {
        id: groupId
    };

    return new Promise(function(resolve, reject) {
        db.query(query, params, function(err, results) {
            if (err) throw new Error('Internal database error');
            return resolve(results);
        });
    });
};

/**
 * Returns all the private galleries of a group
 * @param {Integer} groupId Id of the given group
 * @returns {Promise} Resolves to the galleries if successful, throws exception in case of database error
 */
group.getPrivateGalleries = function(groupId) {
    var query = [
        'MATCH (group:Group)-[:OWNS]->(galleries:Gallery {public: false})',
        'WHERE id(group) = {id}',
        'RETURN galleries.name'
    ].join('\n');

    var params = {
        id: groupId
    };

    return new Promise(function(resolve, reject) {
        db.query(query, params, function(err, results) {
            if (err) throw new Error('Internal database error');
            return resolve(results);
        });
    });
};

/**
 * Returns all the models published in the group
 * @param {Integer} groupId Id of the group
 * @returns {Promise} Resolves to the published models if successful, throws an exception in case of database error
 */
group.getAllModels = function(groupId) {
    var query = [
        'MATCH (group:Group)-[:OWNS]->(galleries:Gallery)<-[:PUBLISHED]-(models:Model)',
        'WHERE id(group) = {id}',
        'RETURN models'
    ].join('\n');

    var params = {
        id: groupId
    };

    return new Promise(function(resolve) {
        db.query(query, params, function(err, results) {
            if (err) throw new Error('Internal database error');
            return resolve(results);
        });
    });
};

/**
 * Returns all the models published in public galleries of the group
 * @param {Integer} groupId
 * @returns {Promise} Resolves to the models published in the group if successful, throws an exception in case of database error
 */
group.getPublicModels = function(groupId) {
    var query = [
        'MATCH (group:Group)-[:OWNS]->(galleries:Gallery {public: true})<-[:PUBLISHED]-(models:Model)',
        'WHERE id(group) = {id}',
        'RETURN models'
    ].join('\n');

    var params = {
        id: groupId
    };

    return new Promise(function(resolve) {
        db.query(query, params, function(err, results) {
            if (err) throw new Error('Internal database error');
            return resolve(results);
        });
    });
};

/**
 * Returns all the models published in private galleries of the group
 * @param {Integer} groupId
 * @returns {Promise} Resolves to the models published in the group if successful, throws an exception in case of database error
 */
group.getPrivateModels = function(groupId) {
    var query = [
        'MATCH (group:Group)-[:OWNS]->(galleries:Gallery {public: false})<-[:PUBLISHED]-(models:Model)',
        'WHERE id(group) = {id}',
        'RETURN models'
    ].join('\n');

    var params = {
        id: groupId
    };

    return new Promise(function(resolve) {
        db.query(query, params, function(err, results) {
            if (err) throw new Error('Internal database error');
            return resolve(results);
        });
    });
};

/**
 * Returns the gallery information of a group
 * @param {Integer} groupId Id of the group
 * @param {String} galleryName Name of the gallery
 * @returns {Promise} Resolves to the gallery information if successful, rejects otherwise, throws exception in case of database error
 */
group.getGallery = function(groupId, galleryName) {
    var query = [
        'MATCH (group:Group)-[:OWNS]->(gallery:Gallery {name: {galleryName}})',
        'WHERE id(group) = {id}',
        'RETURN gallery'
    ].join('\n');

    var params = {
        id: groupId,
        galleryName: galleryName
    };

    return new Promise(function(resolve, reject) {
        db.query(query, params, function(err, results) {
            if (err) throw new Error('Internal Server Error');

            if (results.length > 0)
                return resolve(results[0]);
            else
                return reject('No gallery was found');
        });
    });
};

/**
 * Returns all the models published in a given gallery
 * @param {Integer} groupId Id of the group
 * @param {String} galleryName Name of the gallery
 * @returns {Promise} Resolves to the published models in the gallery, throws an exception in case of a database error
 */
group.getModels = function(groupId, galleryName) {
    var query = [
        'MATCH (group:Group)-[:OWNS]->(galleries:Gallery {name: {galleryName}, public: false})<-[:PUBLISHED]-(models:Model)',
        'WHERE id(group) = {id}',
        'RETURN models'
    ].join('\n');

    var params = {
        id: groupId,
        galleryName: galleryName
    };

    return new Promise(function(resolve) {
        db.query(query, params, function(err, results) {
            if (err) throw new Error('Internal database error');
            return resolve(results);
        });
    });
};

module.exports = group;
