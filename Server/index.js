var Hapi = require('hapi'),
    Joi = require('joi'),
    fuzzy = require('fuzzy'),
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
        'MATCH m<-[c:COMMENTED]-(cAuthor)',
        'WITH *',
        'ORDER BY c.date DESC LIMIT 10',
        'RETURN { name: m.name, description: m.description, files: m.files, downvotes: m.downvotes, upvotes: m.upvotes, publicationDate: m.publicationDate, visibility: m.visibility, tags: m.tags, author: {name: author.name, avatar: author.avatar, about: author.about }, comments: collect({ date: c.date, content: c.content, author: cAuthor.name, avatar: cAuthor.avatar }) } as model'
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

var default_tags = ['abstract','art','black','blue','dark','drawing','girl','green',
    'illustration','light','model','photo','photography','street','woman','pokemon',
    'polygon','animal','human body'];

function getTags(request, reply) {
    client.sadd('tags', default_tags); // ignores if tags already exist
    // TODO: Call sadd on redis when models are created

    client.smembers('tags', function (err, tags) {
        if (err) throw err;
        var filter = request.query.filter;
        var results = fuzzy.filter(filter, tags);
        var matches = results.map(function(m) { return m.string; });
        reply(matches).header('Access-Control-Allow-Origin', "*");
    });
}

server.route({
   method: 'GET',
    path: '/tags',
    handler: getTags,
    config: {
        validate: {
            query: {
                filter: Joi.string().max(30).required()
            }
        }
    }
});

// Start the server
server.start();
