var Boom = require('boom'),
    Fs = require('fs'),
    Path = require('path'),
    Promise = require('bluebird'),
    Model = require('../models/model'),
    User = require('../models/user'),
    Schema = require('../schema'),
    Joi = require('joi'),
    Uid = require('rand-token').uid,
    unzip = require('unzip'),
    readdirp = require('readdirp'),
    UploadNotification = require('../models/notifications').UploadNotification;

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
                .then(function (results) {

                    if (results.length > 0)
                        return reply(Boom.badRequest('A model with that name already exists'));

                    var originalFilename = data.file.hapi.filename;
                    var uid = Uid(64);
                    var uncompressedFolderPath = Path.join((process.env['MESH_MODELS_PATH'] || (process.cwd() + "/models")), uid.toString());
                    var compressedFolderPath = uncompressedFolderPath + '.zip';
                    var storeFile = Fs.createWriteStream(compressedFolderPath);

                    storeFile.on('error', function (err) {
                        //console.error("WritingError:", err);
                        return reply(Boom.badImplementation("Error storing file in the server"));
                    });

                    data.file.pipe(storeFile);
                    //
                    data.file.on('end', function (err) {
                        if (err)
                            return reply().code(500);

                        var readFile = Fs.createReadStream(compressedFolderPath);
                        readFile.pipe(unzip.Extract({ path: uncompressedFolderPath }));

                        readFile.on('end', function (err) {
                            if (err)
                                return reply(Boom.badImplementation('Error decompressing file'));

                            readdirp({root: uncompressedFolderPath, fileFilter: ['*.obj', '*.stl']}, function (errors, res) {

                                if (errors)
                                    console.log("Errors", errors);

                                if (res.files.length == 0)
                                    return reply(Boom.badRequest('No .obj or .stl file was uploaded'));

                                if (res.files.length > 1)
                                    return reply(Boom.badRequest('More than one .obj or .stl file was uploaded'));

                                var mainfilePath = res.files[0].fullPath;
                                var mainFilename = res.files[0].name;
                                var thumbnail = 'http://placehold.it/290x163&text=' + data.name;
                                Model.create(data.name, data.description, mainFilename, originalFilename, mainfilePath, compressedFolderPath, uncompressedFolderPath, ownerName, thumbnail)
                                    .then(function (model) {

                                        Promise.map(data.tags, function (tag) {
                                            return Model.addTag(model.id, tag);
                                        })
                                            .then(function () {

                                                User.getFollowers(ownerName)
                                                    .then(function(users) {
                                                        Promise.map(users, function(user){
                                                            return new Promise(function(resolve) {
                                                                var uploadNotification = new UploadNotification({
                                                                    userTo: user.username,
                                                                    seen: false,
                                                                    date: new Date(),
                                                                    modelId: model.id,
                                                                    modelTitle: data.name,
                                                                    modelThumbnail: thumbnail,
                                                                    uploader: ownerName
                                                                });

                                                                uploadNotification.save(function(err, notification) {
                                                                    if (err) throw err;
                                                                    resolve(notification);
                                                                });
                                                            });
                                                        }).then(function() {
                                                            return reply(model).code(200);
                                                        });
                                                    })
                                                    .catch(function() {
                                                        return reply(Boom.badImplementation('Internal server error: generating notifications'));
                                                    });
                                            })
                                            .catch(function (err) {
                                                return reply(Boom.badImplementation(err));
                                            });
                                    })
                                    .catch(Error, function (error) {
                                        reply(Boom.badImplementation(error.message));
                                    });
                            });
                        });
                    });

                })
                .catch(function () {
                    reply(Boom.badImplementation('Internal Server Error'));
                });
        }
    });
};