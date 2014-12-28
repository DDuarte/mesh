'use strict';

var Hapi = require('hapi');

// Create a server with a host and port
var server = Hapi.createServer(process.argv[2] || 8001, { cors: true });

// Setup mongodb
require('./common/mongoDBClient')('mongodb://localhost:27017/mesh');

require('./routes/')(server);

// Hacks
Object.defineProperty(Error.prototype, 'toJSON', { // make Error JSON.stringify-able
    configurable: true,
    value: function() {
        var alt = {};
        var storeKey = function(key) {
            alt[key] = this[key];
        };
        Object.getOwnPropertyNames(this).forEach(storeKey, this);
        return alt;
    }
});

// Test route
server.route({
    method: 'GET',
    path: '/',
    handler: function (request, reply) {
        reply('Hello! Yes, this is working.');
    }
});

server.pack.register({plugin: require('hapi-route-directory'), options: {path: '/api'}}, function (err) {
    if (err)
        throw err;
});

server.pack.register({plugin: require('hapi-routes-status'), options: {path: '/status'}}, function (err) {
    if (err)
        throw err;
});

// Start the server
server.start(function() {
    console.log('Server running at:', server.info.uri);
});
