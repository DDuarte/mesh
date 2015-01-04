'use strict';

var db = require('../common/db'),
    extend = require('mongoose-schema-extend'),
    Promise = require('bluebird'),
    Schema = db.Schema;

var notificationsSchema = new db.mongo.Schema({
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
    publishedModelThumbnail: String,
    publishedModelTitle: String
});

var groupInviteSchema = notificationsSchema.extend({
    groupName: String,
    inviterName: String,
    inviterAvatar: String,
    accepted: Boolean
});

var groupApplicationSchema = notificationsSchema.extend({
    groupName: String,
    applicantName: String,
    applicantAvatar: String,
    accepted: Boolean
});

notificationsSchema.statics.notifyFollowers = function(user, message, url, image) {
    
};

notificationsSchema.statics.notifyGroup = function(group, userFrom, message, url, image) {
    
};

module.exports.Notification = db.mongo.model('Notification', notificationsSchema);
module.exports.UploadNotification = db.mongo.model('UploadNotification', uploadNotificationSchema);
module.exports.NewFollowerNotification = db.mongo.model('NewFollowerNotification', newFollowerNotificationSchema);
module.exports.NewGroupPublicationNotification = db.mongo.model('NewGroupPublicationNotification', newGroupPublicationSchema);
module.exports.GroupInviteNotification = db.mongo.model('GroupInviteNotification', groupInviteSchema);
module.exports.GroupApplicationNotification = db.mongo.model('GroupApplicationNotification', groupApplicationSchema);
