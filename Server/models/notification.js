var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var Promise = require('bluebird');

var exports = {};

var notificationsSchema = new mongoose.Schema({
    userFrom: String,
    userTo: String,
    url: String,
    image: String,
    message: String,
    seen: Boolean,
    date: Date
});

var Notification = mongoose.model('Notification', notificationsSchema);

exports.notifyFollowers = function(user, message, url, image) {
    
};

exports.notifyUser = function(userTo, userFrom, message, url, image) {
    var notification = new Notification({
        userFrom: userFrom.username,
        userTo: userTo.username,
        url: url,
        image: image,
        message: message,
        seen: false,
        date: new Date()
    });

    return new Promise(function (resolve, reject) {
        notification.save(function (error, savedNotification) {
            if (error) return reject(error);
            return resolve(savedNotification);
        });
    });
};

exports.notifyGroup = function(group, userFrom, message, url, image) {
    
};

exports.remove = function(exports) {
    
};

exports.update = function(updatedNotification) {
    
};

// module.exports = mongoose.model('Notification', notificationsSchema);
module.exports = exports;