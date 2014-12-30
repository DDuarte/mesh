var Joi = require('joi');

module.exports = {
    name: Joi.string().min(5).max(20),
    isPublic: Joi.boolean()
};
