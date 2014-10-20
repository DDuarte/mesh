var Hapi = require('hapi'),
    redis = require('redis'),
    client = redis.createClient(),
    neo4j = require('neo4j'),
    db = new neo4j.GraphDatabase('http://localhost:7474');

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

function getModel(request, reply) {

    var query = [
        'MATCH (m:Model{id : {modelId}})<-[:OWNS]-(author)',
        'RETURN { name: m.name, description: m.description, files: m.files, downVotes: m.downVotes, upVotes: m.upVotes, publicationDate: m.publicationDate, visibility: m.visibility, tags: m.tags, author: {name: author.name, avatar: author.avatar, about: author.about } } as model'
    ].join('\n');

    var params = {
        modelId: Number(request.params.id)
    };


    db.query(query, params, function (err, results) {
        console.log("getModel");
        console.log(results);
        if (err) throw err;
        if (results.length == 0) {
            reply('No such model.').code(404);
        } else {
            reply(results[0].model).header('Access-Control-Allow-Origin', "*");
        }
    });
}

server.route({
    method: 'GET',
    path: '/models/{id}',
    handler: getModel
});

// Start the server
server.start();
