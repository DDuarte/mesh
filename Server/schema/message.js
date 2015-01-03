var Joi = require('joi');

module.exports = {
    userTo: Joi.string(),
    userFrom: Joi.string(),
    content: Joi.string().min(1).max(1024),
    title: Joi.string().min(1).max(64),
    seen: Joi.boolean()
};