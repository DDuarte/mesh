var Hapi = require('hapi'),
    redis = require('redis'),
    client = redis.createClient();

client.on('error', function (err) {
    console.log('Redis error ' + err);
});

// Create a server with a host and port
var server = new Hapi.Server(8000);

// Add the route
server.route({
    method: 'GET',
    path: '/',
    handler: function (request, reply) {
        client.incr('counter', function (err, val) {
            reply('Counter: ' + val);
        });
    }
});

function getUser(request, reply) {
    var id = request.params.id;

    client.incr(id + '_counter', function (err, counter) {
        reply({
            'id': id,
            'counter': counter
        }).header('Access-Control-Allow-Origin', "*");
    });
}

server.route({
    method: 'GET',
    path: '/users/{id}',
    handler: getUser
});

// Start the server
server.start();
