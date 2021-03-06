'use strict';

var User = require('../models/user'),
    Promise = require('bluebird'),
    db = require('../common/db'),
    schema = require('../schema'),
    Boom = require('boom'),
    _ = require('lodash'),
    Message = require('../models/message'),
    Model = require('../models/model'),
    Notifications = require('../models/notifications');

module.exports = function (server) {


    /* server.route({
     method: 'GET',
     path: '/users/{id}',
     handler: function (request, reply) {
     var id = request.params.id;

     db.redis.incr(id + '_counter', function (err, counter) {
     reply({
     'id': id,
     'counter': counter
     });
     });
     }
     });*/

    server.route({
        method: 'GET',
        path: '/users/{username}',
        config: {
            auth: {
                mode: 'optional',
                strategy: 'token'
            },
            validate: {
                params: {
                    username: schema.user.username.required()
                }
            }
        },
        handler: function (request, reply) {
            var username = request.params.username;

            db.redis.incr(username + '_counter', function (err, counter) {
                User.getByUsername(username, request.auth.credentials ? request.auth.credentials.username : '')
                    .then(function (user) {
                        reply(user);
                    })
                    .catch(function (reason) {
                        reply(Boom.notFound(reason));
                    });
            });
        }
    });

    server.route({
        method: 'GET',
        path: '/users/{username}/favourites',
        config: {
            auth: {
                mode: 'optional',
                strategy: 'token'
            },
            validate: {
                params: {
                    username: schema.user.username.required()
                }
            }
        },
        handler: function (request, reply) {

            User.getFavoriteModels(request.params.username).then(function (result) {
                reply(result);
            }, function (error) {
                reply('Internal error').code(500);
            });
        }
    });

    server.route({
        method: 'POST',
        path: '/users/{username}/favourites',
        config: {
            auth: 'token',
            validate: {
                params: {
                    username: schema.user.username.required()
                },
                payload: {
                    modelid: schema.model.id.required()
                }
            }
        },
        handler: function (request, reply) {
            if (request.params.username != request.auth.credentials.username)
                reply('Permission denied').code(403);

            User.addFavouriteModel(request.auth.credentials.username, request.payload.modelid).then(function (result) {
                if (result.length == 0) {
                    reply('No such model.').code(404);
                } else {
                    reply(result);
                }
            }, function (error) {
                reply('Internal error').code(500);
            });
        }
    });

    server.route({
        method: 'DELETE',
        path: '/users/{username}/favourites',
        config: {
            auth: 'token',
            validate: {
                params: {
                    username: schema.user.username.required()
                },
                payload: {
                    modelid: schema.model.id.required()
                }
            }
        },
        handler: function (request, reply) {
            if (request.params.username != request.auth.credentials.username)
                reply('Permission denied').code(403);

            User.removeFavouriteModel(request.auth.credentials.username, request.payload.modelid).then(function (result) {
                if (!result) {
                    reply('No such model.').code(404);
                } else {
                    reply(result);
                }
            }, function (error) {
                reply('Internal error').code(500);
            });
        }
    });

    server.route({
        method: 'GET',
        path: '/users/{username}/groups',
        config: {
            auth: {
                mode: 'optional',
                strategy: 'token'
            },
            validate: {
                params: {
                    username: schema.user.username.required()
                }
            }
        },
        handler: function (request, reply) {
            var isOwnUser = false;
            if (request.auth.credentials) {
                if (request.auth.credentials.username == request.params.username)
                    isOwnUser = true;
            }

            User.getGroups(request.params.username, isOwnUser).then(function (result) {
                reply(result);
            }, function () {
                reply(Boom.badImplementation('Internal server error'));
            });
        }
    });

    server.route({
        method: 'GET',
        path: '/users/{username}/followers',
        config: {
            auth: false,
            validate: {
                params: {
                    username: schema.user.username.required()
                }
            }
        },
        handler: function (request, reply) {
            User.getFollowers(request.params.username).then(function (result) {
                reply(result);
            }, function (error) {
                reply('Internal error').code(500);
            });
        }
    });

    server.route({
        method: 'POST',
        path: '/users/{username}/followers',
        config: {
            auth: 'token',
            validate: {
                params: {
                    username: schema.user.username.required()
                },
                payload: {
                    otheruser: schema.user.username.required(),
                    avatar: schema.user.avatar.required()
                }
            }
        },
        handler: function (request, reply) {
            if (request.params.username != request.auth.credentials.username)
                reply('Permission denied').code(403);
            if (request.params.username == request.payload.otheruser)
                reply('Can\'t follow yourself').code(400);

            User.followUser(request.auth.credentials.username, request.payload.otheruser).then(function (result) {
                if (result.length == 0) {
                    reply('No such user.').code(404);
                } else {

                    var newFollowerNotification = new Notifications.NewFollowerNotification({
                        seen: false,
                        date: new Date(),
                        userTo: request.payload.otheruser,
                        follower: request.auth.credentials.username,
                        followerAvatar: request.payload.avatar
                    });

                    newFollowerNotification.save(function (err) {
                        if (err)
                            return reply(Boom.badImplementation("Error generating notifications"));

                        reply(result);
                    });

                }
            }, function (error) {
                reply('Internal error').code(500);
            });
        }
    });

    server.route({
        method: 'DELETE',
        path: '/users/{username}/followers',
        config: {
            auth: 'token',
            validate: {
                params: {
                    username: schema.user.username.required()
                },
                payload: {
                    otheruser: schema.user.username.required()
                }
            }
        },
        handler: function (request, reply) {
            if (request.params.username != request.auth.credentials.username)
                reply('Permission denied').code(403);

            User.unfollowUser(request.auth.credentials.username, request.payload.otheruser).then(function (result) {
                if (!result) {
                    reply('No such user.').code(404);
                } else {
                    reply(result);
                }
            }, function (error) {
                reply('Internal error').code(500);
            });
        }
    });

    server.route({
        method: 'GET',
        path: '/users/{username}/following',
        config: {
            auth: false,
            validate: {
                params: {
                    username: schema.user.username.required()
                }
            }
        },
        handler: function (request, reply) {
            User.getFollowing(request.params.username).then(function (result) {
                reply(result);
            }, function (error) {
                reply('Internal error').code(500);
            });
        }
    });

    server.route({
        method: 'GET',
        path: '/users/{username}/models',
        config: {
            auth: false,
            validate: {
                params: {
                    username: schema.user.username.required()
                }
            }
        },
        handler: function (request, reply) {
            User.getAllModels(request.params.username).then(function (models) {
                reply(models);
            }, function (error) {
                reply('Internal error').code(500);
            });
        }
    });

    server.route({
        method: 'GET',
        path: '/users/{username}/galleries',
        config: {
            auth: {
                mode: 'optional',
                strategy: 'token'
            },
            validate: {
                params: {
                    username: schema.user.username.required()
                }
            }
        },
        handler: function (request, reply) {
            var isOwner = false;
            if (request.auth.credentials && request.auth.credentials.username == request.params.username)
                isOwner = true;

            User.getAllGalleries(request.params.username, isOwner)
                .then(function (galleries) {
                    return reply(galleries);
                })
                .catch(function () {
                    return reply(Boom.badImplementation('Internal server error'));
                });
        }
    });

    server.route({
        method: 'POST',
        path: '/users/{username}/galleries',
        config: {
            auth: 'token',
            validate: {
                params: {
                    username: schema.user.username.required()
                },
                payload: {
                    galleryName: schema.gallery.name.required()
                }
            }
        },
        handler: function (request, reply) {
            if (request.auth.credentials.username != request.params.username)
                return reply(Boom.forbidden('No permissions'));

            User.galleryExists(request.params.username, request.payload.galleryName)
                .then(function (exists) {
                    if (exists)
                        return reply(Boom.badRequest('A gallery with that name already exists'));

                    User.createGallery(request.params.username, request.payload.galleryName)
                        .then(function (gallery) {
                            return reply(gallery);
                        })
                        .catch(function () {
                            return reply(Boom.badImplementation('Internal server error'));
                        });
                })
                .catch(function () {
                    return reply(Boom.badImplementation('Internal server error'));
                });
        }
    });

    server.route({
        method: 'GET',
        path: '/users/{username}/galleries/{galleryName}',
        config: {
            auth: 'token',
            validate: {
                params: {
                    username: schema.user.username.required(),
                    galleryName: schema.gallery.name.required()
                }
            }
        },
        handler: function (request, reply) {
            Model.getByGallery(request.params.username, request.params.galleryName)
                .then(function (models) {
                    return reply(models);
                })
                .catch(function () {
                    return reply(Boom.badImplementation('Internal server error'));
                });
        }
    });

    server.route({
        method: 'PATCH',
        path: '/users/{username}/galleries/{galleryName}',
        config: {
            auth: 'token',
            validate: {
                params: {
                    username: schema.user.username.required(),
                    galleryName: schema.gallery.name.required()
                },
                payload: {
                    isPublic: schema.gallery.isPublic.required()
                }
            }
        },
        handler: function (request, reply) {
            if (request.auth.credentials.username != request.params.username)
                return reply(Boom.forbidden('No permissions'));

            User.updateGallery(request.params.username, request.params.galleryName, request.payload.isPublic)
                .then(function () {
                    console.log("Success");
                    return reply().code(200);
                })
                .catch(function () {
                    return reply(Boom.badImplementation('Internal server error'));
                });
        }
    });

    server.route({
        method: 'DELETE',
        path: '/users/{username}/galleries/{galleryName}',
        config: {
            auth: 'token',
            validate: {
                params: {
                    username: schema.user.username.required(),
                    galleryName: schema.gallery.name.required()
                }
            }
        },
        handler: function (request, reply) {
            if (request.auth.credentials.username != request.params.username)
                return reply(Boom.forbidden('No permissions'));

            User.removeGallery(request.params.username, request.params.galleryName)
                .then(function () {
                    console.log("Success");
                    return reply().code(200);
                })
                .catch(function () {
                    return reply(Boom.badImplementation('Internal server error'));
                });
        }
    });

    server.route({
        method: 'PATCH',
        path: '/users/{username}',
        config: {
            auth: 'token',
            validate: {
                params: {
                    username: schema.user.username.required()
                },
                payload: {
                    firstName: schema.user.firstName,
                    lastName: schema.user.lastName,
                    birthdate: schema.user.birthdate,
                    country: schema.user.country,
                    about: schema.user.about,
                    interests: schema.user.interests
                }
            }
        },
        handler: function (request, reply) {
            if (request.params.username != request.auth.credentials.username)
                reply('Permission denied').code(403);

            var fields = _.pick(request.payload, function (value, key) {
                return key != 'interests';
            });
            User.replaceInterests(request.auth.credentials.username, request.payload.interests)
                .then(function () {
                    User.update(request.auth.credentials.username, fields).then(function (results) {
                        if (results.length == 0) {
                            reply('No such user.').code(404);
                        } else {
                            return reply(results[0]['userInfo']);
                        }
                    }, function (error) {
                        reply('Internal error').code(500);
                    });
                })
                .catch(function () {
                    return reply(Boom.badImplementation('Internal server error'));
                });
        }
    });
};