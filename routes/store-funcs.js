var config = require('../config');
var fcm = require('../fcm');
var _async = require('async');

var Store = require('../models/Store');
var Super = require('../models/Super');

var computeQueue = function(store) {
  store = store.toObject();
  store.queue = store.users.length;
  return store;
}

module.exports.newSuper = function newSuper(obj, cb) {
  var store = new Store();

  if (obj.name)
    store.name = obj.name;

  var superId;
  if (obj.superId)
    superId = obj.superId;
  else
    return cb('No super_id specified');

  store.storeTurn = 1;
  store.usersTurn = 1;
  store.users = [];

  Super.findOne({_id: superId}, 'stores')
  .populate('stores')
  .exec(function (err, result) {
    if(err)
      cb(err);

    var storeNames = result.stores.map(function(s) {
      return s.name;
    });

    var storeFound = storeNames.indexOf(store.name) !== -1;

    if (storeFound)
      return cb('This store already exists');

    store.save(function(err, newStore) {
      if (err)
        return cb(err);

      // save the store and check for errors
      var supermrkt = new Super();
      Super.update({_id: superId}, {$push: {stores: store._id}}, function (err, raw){
        if (err)
          return cb(err);

        cb(null, {storeId: newStore._id, superId: superId});
      });
    });
  });
};

module.exports.getStoreList = function getStoreList(cb) {
  Store.find(function(err, stores) {
    if (err)
      return cb(err);

    cb(null, stores.map(computeQueue));
  });
};

module.exports.getStoreById = function getStoreById(id, cb) {
  Store.findById(id, function(err, foundStore) {
    if (err)
      return cb(err);

    cb(null, foundStore ? computeQueue(foundStore) : null);
  });
};

module.exports.updateStore = function updateStore(id, obj, cb) {
  Store.findById(id, function(err, foundStore) {
    if (err)
      return cb(err);

    foundStore.name = obj.name;

    foundStore.save(function(err) {
      if (err)
        return cb(err);

      cb(null);
    });
  });
};

module.exports.removeStore = function removeStore(id, cb) {
  Store.remove({_id: id}, function(err, store) {
    if (err)
      return cb(err);

    cb(null);
  });
};

module.exports.addUserToStoreQueue = function addUserToStoreQueue(uid, sid, cb) {
  Store.find({users: uid}, function(err, store){
    if(err)
      return cb(err);

    if (store.length > 0)
     return cb('This user already picked a ticket in this store!');

    Store.findByIdAndUpdate(
      {_id: sid},
      {$push: {users: uid}},
      {safe: true, upsert: true, new : true},
      function (err, foundStore){
        if (err)
          return cb(err);

        var userTurn = foundStore.usersTurn;
        foundStore.usersTurn++;

        if (foundStore.usersTurn > config.stores.maxTurn)
          foundStore.usersTurn = 1;

        fcm.FCMNotificationBuilder()
          .setTopic('store.' + foundStore._id)
          .addData('usersTurn', foundStore.usersTurn)
          .addData('storeQueue',foundStore.users.length)
          .send(function(err, res) {
           if (err)
             console.log('FCM error:', err);
          });

        foundStore.save(function(err) {
          if (err)
            return cb(err);

          cb(null, userTurn);
        });
      }
    );
  });
};

module.exports.removeUserFromStoreQueue = function removeUserFromStoreQueue(uid, sid, cb) {
  Store.update(
    {_id: sid},
    {$pull: {users: uid}},
    {multi: true},
    function(err, user) {
      if (err)
        return cb(err);

      cb(null);
    });
}

module.exports.getStoreTurn = function getStoreTurn(id, cb) {
  Store.findById(id, function(err, foundStore) {
    if (err)
      return cb(err);

    cb(null, foundStore.storeTurn);
  });
};

module.exports.getStoreQueue = function getStoreQueue(id, cb) {
  Store.findById(id, function(err, foundStore) {
    if (err)
      return cb(err);

    cb(null, foundStore.users.length);
  });
};

module.exports.advanceStoreTurn = function advanceStoreTurn(id, cb) {
  Store.findById(id , function (err, foundStore){
    if (err)
      return cb(err);

    foundStore.storeTurn++;

    if (foundStore.storeTurn > config.stores.maxTurn)
      foundStore.storeTurn = 1;

    _async.parallel([

      function(cb) {
        Store.update(
          {_id: id},
          {$pull: {users: foundStore.users[0]}},
          {multi: true},
          function(err, user) {
            if (err)
              return cb(err);

            cb(null);
          }
        );
      },

      function(cb) {
        foundStore.save(function(err) {
          cb(err);
        });
      }
    ],

    function(err) {
      if (err)
        return cb(err);

      fcm.FCMNotificationBuilder()
        .setTopic('store.' + foundStore._id)
        .addData('storeTurn', foundStore.storeTurn)
        .send(function(err, res) {
         if (err)
           console.log('FCM error:', err);
        });

      cb(null, foundStore.storeTurn);
    });
  });
};
