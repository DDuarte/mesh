var mongoose = require('mongoose'),
    extend = require('mongoose-schema-extend'),
    Schema = mongoose.Schema;

var Promise = require('bluebird');

var notificationsSchema = new mongoose.Schema({
    userTo: String,
    seen: Boolean,
    date: Date
}, { collection : 'notifications', discriminatorKey : '_type' });

var uploadNotificationSchema = notificationsSchema.extend({
    uploader: String,
    uploaderAvatar: String,
    modelThumbnail: String,
    modelTitle: String,
    modelId: Number
});

var newFollowerNotificationSchema = notificationsSchema.extend({
    follower: String,
    followerAvatar: String
});

var newGroupPublicationSchema = notificationsSchema.extend({
    publisher: String,
    publisherAvatar: String,
    groupName: String,
    groupId: Number,
    publishedModelId: Number,
    publishedModelThumbnail: String
});

var groupInviteSchema = notificationsSchema.extend({
    groupName: String,
    groupId: Number,
    inviterName: String,
    inviterAvatar: String
});

notificationsSchema.statics.notifyFollowers = function(user, message, url, image) {
    
};

notificationsSchema.statics.notifyGroup = function(group, userFrom, message, url, image) {
    
};

notificationsSchema.statics.remove = function(exports) {
    
};

notificationsSchema.statics.update = function(updatedNotification) {
    
};

module.exports.Notification = mongoose.model('Notification', notificationsSchema);
module.exports.UploadNotification = mongoose.model('UploadNotification', uploadNotificationSchema);
module.exports.NewFollowerNotification = mongoose.model('NewFollowerNotification', newFollowerNotificationSchema);
module.exports.NewGroupPublicationNotification = mongoose.model('NewGroupPublicationNotification', newGroupPublicationSchema);
module.exports.GroupInviteNotification = mongoose.model('GroupInviteNotification', groupInviteSchema);
