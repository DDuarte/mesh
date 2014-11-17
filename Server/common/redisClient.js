module.exports = function () {
    var redis = require('redis');
    var client = redis.createClient();
    client.on('error', function (err) {
        console.log('Redis error ' + err);
    });
    return client;
};