'use strict';

var db = require('../common/db');

module.exports = function (server) {

    server.route({
        method: 'POST',
        path: '/logout',
        config: {auth: 'token'},
        handler: function (request, reply) {
            db.redis.del(request.auth.credentials.username);
            return reply({});
        }
    });
};