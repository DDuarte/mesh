var Joi = require('joi');

module.exports = {
    filter: Joi.string().max(30)
};
