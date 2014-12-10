var Boom = require('boom');
var Fs = require('fs');
var Path = require('path');
var Model = require('../models/model');
var Schema = require('../schema');
var Joi = require('joi');
var Uid = require('rand-token').uid;

module.exports = function (server) {

    server.route({
        path: '/upload',
        method: 'POST',
        config: {
            auth: 'token',
            validate: {
                payload: {
                    name: Schema.model.name.required(),
                    description: Schema.model.description.required(),
                    tags: Schema.model.tags.required(),
                    file: Schema.model.file.required()
                }
            },
            payload: {
                output: 'stream',
                parse: true,
                allow: 'multipart/form-data',
                maxBytes: 20000000
            }
        },
        handler: function (request, reply) {
            var data = request.payload;
            var ownerName = request.auth.credentials.username;
            Model.getByName(data.name)
                .then(function () {
                    reply(Boom.badRequest('A model with that name already exists'));
                })
                .catch(Error, function (error) {
                    reply(Boom.badImplementation(error.message));
                })
                .catch(function () {
                    var originalFilename = data.file.hapi.filename;
                    var uid = Uid(64);
                    var path = Path.join((process.env['MESH_MODELS_PATH'] || (process.cwd() + "/models")), uid.toString() + '_' + data.file.hapi.filename);
                    var file = Fs.createWriteStream(path);

                    file.on('error', function (err) {
                        console.error("WritingError:", err);
                        return reply(Boom.badImplementation("Error storing file in the server"));
                    });

                    data.file.pipe(file);

                    data.file.on('end', function (err) {

                        if (err)
                            return reply(Boom.badImplementation("Error saving file on the server"));

                        Model.create(data.name, data.description, originalFilename, path, ownerName)
                            .then(function (model) {
                                reply(model).code(200);
                            })
                            .catch(Error, function (error) {
                                reply(Boom.badImplementation(error.message));
                            });
                    });

                });
        }
    });
};