module.exports = function (server) {
    require('./login')(server);
    require('./logout')(server);
    require('./register')(server);
    require('./user')(server);
    require('./model')(server);
    require('./tag')(server);
};
