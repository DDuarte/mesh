module.exports = function () {
    var neo4j = require('neo4j');
    return new neo4j.GraphDatabase(
        process.env['NEO4J_URL'] ||
        process.env['GRAPHENEDB_URL'] ||
        'http://localhost:7474'
    );
}();