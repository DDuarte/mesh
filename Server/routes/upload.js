var Fs = require('fs');
var Boom = require('boom');
var Model = require('../models/model');
var ModelSchema = require('../schema/model');
var Joi = require('joi');

module.exports = function (server) {
    server.route({
        path: '/upload',
        method: 'POST',
        config: {
            auth: 'token',
            validate: {
                payload: {
                    name: ModelSchema.name.required(),
                    description: ModelSchema.description.required()
                }
            },
            payload: {
                output: 'stream',
                parse: true,
                allow: 'multipart/form-data'
            }
        },
        handler: function (request, reply) {
            var data = request.payload;
            var ownerName = request.auth.credentials.username;

            Model.getByName(request.payload.name)
                .then(function () {
                    reply(Boom.badRequest('A model with that name already exists'));
                })
                .catch(Error, function (error) {
                    reply(Boom.badImplementation(error.message));
                })
                .catch(function () {
                    if (data.file) {
                        var name = data.file.hapi.filename;
                        var path = __dirname + "/models/" + name;
                        var file = Fs.createWriteStream(path);

                        file.on('error', function (err) {
                            console.error(err)
                        });

                        data.file.pipe(file);

                        data.file.on('end', function (err) {

                            if (err)
                                return reply(Boom.badImplementation("Error saving file on the server"));

                            Model.create(request.payload.name, request.payload.description, path, ownerName)
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