var Fs = require('fs');
var Boom = require('boom');
var Model = require('../models/model');
var ModelSchema = require('../schema/model');
var Joi = require('joi');

module.exports = function (server) {

    // Validation is a tricky business with multipart form data, do it in the handler until a better solution is found
    server.route({
        path: '/upload',
        method: 'POST',
        config: {
            auth: 'token',
            payload: {
                output: 'stream',
                parse: true,
                allow: 'multipart/form-data'
            }
        },
        handler: function (request, reply) {
            var data = request.payload;
            var ownerName = request.auth.credentials.username;

            if (!data.name)
                return reply(Boom.badRequest("name payload parameter is missing"));

            if (!data.description)
                return reply(Boom.badRequest("description payload parameter is missing"));

            if (!data.file)
                return reply(Boom.badRequest("File is missing"));


            var path = __dirname + "/models/" + data.file.hapi.filename;
            var file = Fs.createWriteStream(path);

            file.on('error', function (err) {
                console.error("WritingError:", err);
                return reply(Boom.badImplementation("Error storing file in the server"));
            });

            data.file.pipe(file);

            data.file.on('end', function (err) {

                if (err)
                    return reply(Boom.badImplementation("Error saving file on the server"));

                return reply("file piped successfuly").code(500);
            });

            Model.getByName(data.name)
                .then(function () {
                    reply(Boom.badRequest('A model with that name already exists'));
                })
                .catch(Error, function (error) {
                    reply(Boom.badImplementation(error.message));
                })
                .catch(function () {
                    if (data.file) {

                        // TODO: Change upload directory to an environment variable
                        var path = __dirname + "/models/" + data.file.hapi.filename;
                        var file = Fs.createWriteStream(path);

                        file.on('error', function (err) {
                            console.error("WritingError:", err);
                            return reply(Boom.badImplementation("Error storing file in the server"));
                        });

                        data.file.pipe(file);

                        data.file.on('end', function (err) {

                            if (err)
                                return reply(Boom.badImplementation("Error saving file on the server"));

                            Model.create(data.name, data.description, path, ownerName)
                                .then(function (model) {
                                    reply(model).code(200);
                                })
                                .catch(Error, function (error) {
                                    reply(Boom.badImplementation(error.message));
                                });
                        });
                    }
                });
        }
    });
};