'use strict';

var db = require('../common/db'),
    Schema = db.mongo.Schema;

var messageSchema = new db.mongo.Schema({
    userFrom: String,
    userFromAvatar: String,
    userTo: String,
    userToAvatar: String,
    date: Date,
    seen: Boolean,
    title: String,
    content: String,
    userToDeleted: Boolean,
    userFromDeleted: Boolean
});

module.exports = db.mongo.model('Message', messageSchema);
