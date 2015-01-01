var Joi = require('joi');

module.exports = {
    id: Joi.number().integer().min(1),
    name: Joi.string().min(5).max(20),
    description: Joi.string().min(10).max(254),
    visibility: Joi.string().regex(/(public)|(private)/),
    creationDate: Joi.string().isoDate(),
    galleryName: Joi.string().min(5).max(20)
};
