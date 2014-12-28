var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var notificationSchema = new mongoose.Schema({
    userFrom: String,
    userTo: String,
    url: String,
    image: String,
    message: String,
    seen: Boolean,
    date: Date
});

module.exports = mongoose.model('Notification', notificationSchema);
