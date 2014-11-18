var Joi = require('joi');

module.exports = {
    firstName: Joi.string().max(20),
    lastName: Joi.string().max(20),
    username: Joi.string().min(3).max(20),
    email: Joi.string().email(),
    password: Joi.string().max(256),
    birthdate: Joi.date(),
    country: Joi.string(), // move list to server and validate properly
    rememberMe: Joi.boolean()
};
