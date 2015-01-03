var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var messageSchema = new mongoose.Schema({
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

module.exports = mongoose.model('Message', messageSchema);
