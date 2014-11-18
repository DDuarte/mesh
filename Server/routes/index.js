// the order of the require clauses should be maintained, there are dependencies

module.exports = function (server) {
    require('./login')(server);
    require('./logout')(server);
    require('./token')(server);
    require('./register')(server);
    require('./user')(server);
    require('./model')(server);
    require('./tag')(server);
};
