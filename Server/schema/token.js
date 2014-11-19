var Joi = require('joi');

module.exports = {
    token: Joi.string().min(16).max(16)
};
