'use strict';

var redis = require('redis');
var client = redis.createClient();

module.exports = function (server) {

    server.route({
        method: 'POST',
        path: '/logout',
        config: {auth: 'token'},
        handler: function (request, reply) {
            client.remove(request.auth.username);
            return reply({});
        }
    });
};