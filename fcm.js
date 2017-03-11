var FCM = require('fcm-node');
var apikey = require('./fcm-creds').apikey;

var fcm = new FCM(apikey);

module.exports.FCMInstance = fcm;

module.exports.FCMNotificationBuilder = function() {
  var message = {};

  return {
    setDestination: function(destination) {
      message.to = destination;
      return this;
    },

    setTopic: function(topic) {
      return this.setDestination('/topics/' + topic);
    },

    setCollapseKey: function(key) {
      message.collapse_key = key;
      return this;
    },

    setNotificationTitle: function(title) {
      if (!message.notification)
        message.notification = {};

      message.notification.title = title;
      return this;
    },

    setNotificationBody: function(body) {
      if (!message.notification)
        message.notification = {};

      message.notification.body = body;
      return this;
    },

    addData: function(k, v) {
      if (!message.data)
        message.data = {};

      message.data[k] = v;
      return this;
    },

    build: function() {
      console.log(message);
      if (!message.to)
        throw 'Destination unspecified!';

      if (!message.notification && !message.data)
        throw 'No data specified!';

      return message;
    },

    send: function(cb) {
      fcm.send(this.build(), cb);
    }
  };
};
