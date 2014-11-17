var Joi = require('joi');

module.exports = {
    id: Joi.number().integer().min(1),
    date: Joi.string().isoDate(),
    comment: Joi.string().trim().min(1).max(1024),
    vote: Joi.string().trim().regex(/(DOWN)|(UP)/)
};
