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
        'CREATE (group:Group {name: {name}, creationDate: {creationDate}})',
        'MATCH (user:User {name: {adminName}})',
        'CREATE (group)<-[:IS_ADMIN]-(user)',
        'RETURN group'
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
        'MATCH (group:Group {name: {name}})',
        'RETURN group'
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
        id: id
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

module.exports = group;