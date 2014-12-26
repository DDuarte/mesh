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

mongoose.model('Notification', notificationSchema);

mongoose.connect('mongodb://localhost:27017/mesh');