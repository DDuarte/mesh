var Joi = require('joi');

module.exports = {
    id: Joi.number().integer().min(1),
    name: Joi.string().min(5).max(20),
    description: Joi.string().min(10).max(254),
    date: Joi.string().isoDate(),
    comment: Joi.string().trim().min(1).max(1024),
    vote: Joi.string().trim().regex(/(DOWN)|(UP)/),
    file: Joi.any(),
    tags: Joi.array().includes(Joi.string()),
    isPublic: Joi.boolean()
};
