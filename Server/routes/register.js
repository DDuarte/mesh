'use strict';

var Nodemailer = require('nodemailer'),
    User = require('../models/user'),
    Boom = require('boom'),
    uid = require('rand-token').uid,
    redis = require('redis'),
    client = redis.createClient();

var schema = require('../schema');

module.exports = function (server) {

    // create reusable transporter object using SMTP transport
    var transporter = Nodemailer.createTransport({
        service: 'Gmail',
        auth: {
            user: 'noreply@meshdev.ddns.net',
            pass: 'B4nanalol'
        }
    });

    server.route({
        method: 'POST',
        path: '/register',
        config: {
            auth: false,
            validate: {
                payload: {
                    firstName: schema.user.firstName.required().max(20),
                    lastName: schema.user.lastName.required().max(20),
                    username: schema.user.username.required().min(3).max(20),
                    email: schema.user.email.required(),
                    password: schema.user.password.required().max(256),
                    birthdate: schema.user.birthdate.required(),
                    country: schema.user.country.required() // TODO: Include all countries in the list
                }
            }
        },
        handler: function (request, reply) {
            var username = request.payload.username;
            var email = request.payload.email;

            // associated the generated token with the user
            client.hset("account_tokens", request.auth.credentials.username, token);

            User.getByUsername(username).then(function (userData) {
                if (userData[0]) {
                    return reply(Boom.conflict('Existing user'));
                }
            });

            User.getByEmail(email).then(function (userData) {
                if (userData[0]) {
                    return reply(Boom.conflict('Existing user'));
                }
            });

            request.payload.active = false;
            User.create(request.payload).then(function () {
                var token = uid(16);
                // setup e-mail data with unicode symbols
                var mailOptions = {
                    from: 'noreply@meshdev.ddns.net', // sender address
                    to: email, // list of receivers
                    subject: 'Mesh: Account verification', // Subject line
                    html: '<b>Greetings from the Mesh team! You can activate your account here:</b><br>' +
                        '<a src="' + server.url.dev + "/activateToken?token=" + token + '&username=' + request.payload.username + '">' + '</a>' // TODO: change server base url
                };

                // send mail with defined transport object
                transporter.sendMail(mailOptions, function (error, info) {
                    if (error) {
                        reply(Boom.badImplementation('Internal error: failed to send email'));
                    }
                });

                reply().code(200);
            }).catch(function () {
                reply(Boom.badImplementation('Failed to insert the user into the database'));
            });

        }
    });
};
