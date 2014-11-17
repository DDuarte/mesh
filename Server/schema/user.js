var Joi = require('joi');

module.exports = {
    firstName: Joi.string(),         // TODO validate length
    lastName: Joi.string(),          // TODO validate length
    username: Joi.string(),          // TODO validate length
    email: Joi.string().email(),
    password: Joi.string(),          // TODO validate length
    birthdate: Joi.date(),
    country: Joi.string(), // move list to server and validate properly
    rememberMe: Joi.boolean()
};
