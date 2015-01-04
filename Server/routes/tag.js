
var db = require('../common/db'),
    Tag = require('../models/tags.js'),
    fuzzy = require('fuzzy'),
    Boom = require('boom'),
    schema = require('../schema');

var default_tags = ['abstract', 'art', 'black', 'blue', 'dark', 'drawing', 'girl', 'green',
    'illustration', 'light', 'model', 'photo', 'photography', 'street', 'woman', 'pokemon',
    'polygon', 'animal', 'human body'];


module.exports  = function (server) {

    function getTags(request, reply) {
        /*
        Tag.getMostUsed().then(function(res) {
                reply(res);
            }
        );*/

        db.redis.sadd('tags', default_tags); // ignores if tags already exist
        // TODO: Call sadd on redis when models are created

        db.redis.smembers('tags', function (err, tags) {
            if (err) throw err;

            var matches = [];
            var filter = request.query.filter;
            if (filter) {
                var results = fuzzy.filter(filter, tags);
                matches = results.map(function (m) {
                    return m.string;
                });
            } else {
                matches = tags;
            }

            reply(matches);
        });

    }

    server.route({
        method: 'GET',
        path: '/tags',
        handler: getTags,
        config: {
            validate: {
                query: {
                    filter: schema.tag.filter.optional()
                }
            }
        }
    });
};
