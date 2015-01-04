var mongoose = require('mongoose'),
    neo4j = require('neo4j'),
    redis = require('redis');

var db = {};

db.setup = function() {
    mongoose.connect(
        process.env['MONGODB_URL'] ||
        'mongodb://localhost:27017/mesh'
    );

    db.mongo = mongoose;

    db.neo4j = new neo4j.GraphDatabase(
        process.env['NEO4J_URL'] ||
        process.env['GRAPHENEDB_URL'] ||
        'http://localhost:7474'
    );

    db.redis = redis.createClient(
        process.env['REDIS_PORT'] || 6379,
        process.env['REDIS_HOST'] || '127.0.0.1'
    );

    db.redis.on('error', function (err) {
        console.log('Redis error ' + err);
    });
};

module.exports = db;
