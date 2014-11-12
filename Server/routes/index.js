module.exports = function (server) {
    require('./login')(server);
    require('./logout')(server);
    require('./register')(server);
};
