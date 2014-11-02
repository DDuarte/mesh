module.exports = function (server) {
    require('./user')(server);
    require('./login')(server);
};