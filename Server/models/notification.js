var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var Promise = require('bluebird');

var notificationsSchema = new mongoose.Schema({
    userFrom: String,
    userTo: String,
    url: String,
    image: String,
    message: String,
    seen: Boolean,
    date: Date
});

notificationsSchema.statics.notifyFollowers = function(user, message, url, image) {
    
};

notificationsSchema.statics.notifyUser = function(userTo, userFrom, message, url, image) {
    image = image || null;

    if (image == null && userFrom != null) {
        image = userFrom.avatar;
    }

    var notification = new this({
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

notificationsSchema.statics.notifyGroup = function(group, userFrom, message, url, image) {
    
};

notificationsSchema.statics.remove = function(exports) {
    
};

notificationsSchema.statics.update = function(updatedNotification) {
    
};

module.exports = mongoose.model('Notification', notificationsSchema);