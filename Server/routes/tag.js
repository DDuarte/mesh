
var db = require('../common/db'),
    Tag = require('../models/tags.js'),
    fuzzy = require('fuzzy'),
    Boom = require('boom'),
    CronJob = require('cron').CronJob,
    moment = require('moment'),
    schema = require('../schema');

var default_tags = ['abstract', 'art', 'black', 'blue', 'dark', 'drawing', 'girl', 'green',
    'illustration', 'light', 'model', 'photo', 'photography', 'street', 'woman', 'pokemon',
    'polygon', 'animal', 'human body'];


module.exports  = function (server) {

    function getTags(request, reply) {

        db.redis.lrange('tagList', 0, -1, function (err, tags) {
            if (err) throw err;

            //tags = tags[0].split(',');
            console.log(tags);
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

    var generateTagList = function () {
        Tag.getMostUsed().then(function (result) {
            if (result.length == 0) {
                console.log('generateCatalogLists: empty result from getTopRatedModelIds');
                return;
            }

            result.unshift('tagList');

            db.redis.del('tagList');
            db.redis.send_command('rpush', result);
            db.redis.set('tagListTime', moment().utc().format("YYYY-MM-DD HH:mm").toString());
        }, function (error) {
            if (error) {
                console.log('generateTagLists-2: ' + JSON.stringify(error));
            }
        });
    };

    new CronJob('*/30 * * * * *', generateTagList, null, true);
    generateTagList();
};
