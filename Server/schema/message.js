var Joi = require('joi');

module.exports = {
    userTo: Joi.string(),
    userFrom: Joi.string(),
    content: Joi.string().min(10).max(1024),
    title: Joi.string().min(5).max(20),
    seen: Joi.boolean()
};