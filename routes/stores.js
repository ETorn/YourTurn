var config = require('../config');
var fcm = require('../fcm');
var _async = require('async');

var computeQueue = function(store) {
  store = store.toObject();
  store.queue = store.users.length;
  return store;
}

module.exports = function(router) {
  var Store = require('../models/Store');
  var Super = require('../models/Super');

  router.route('/stores')
    .post(function(req, res) {
      var store = new Store();
        // save the store and check for errors
        var superId;
        if (req.body.name)
          store.name = req.body.name;

        if (req.body.superId)
          superId = req.body.superId;
        else
          return res.json({message: 'No super_id specified'})

        store.storeTurn = 1;
        store.usersTurn = 1;
        store.users = [];

        // save the user and check for errors
        Super.findOne({_id: superId}, 'stores')
        .populate('stores')
        .exec(function (err, result) {
          if(err)
            console.log(err);

          var storeNames = result.stores.map(function(s) {
            return s.name;
          });

          var storeFound = storeNames.indexOf(store.name) !== -1;

          if (storeFound){
            return res.json({message: 'This store already exists'});
          }else{
            // save the super and check for errors
            store.save(function(err, newStore) {
              if (err)
                return res.send(err);

              // save the store and check for errors
              var supermrkt = new Super();
              Super.update({_id: superId}, {$push: {stores: store._id}}, function (err, raw){
                if (err)
                  return res.send(err);

                res.json({ message: 'Store created!', storeId: newStore._id, superId: superId});
              });
            });
          }
        });
      })
      .get(function(req, res) {
        Store.find(function(err, stores) {
          if (err)
            return res.send(err);

          res.json(stores.map(computeQueue));
        });
      });

  router.route('/stores/:store_id')
    .get(function(req, res) {
      Store.findById(req.params.store_id, function(err, foundStore) {
        if (err)
          return res.send(err);

        res.json(computeQueue(foundStore));
      });
    })
    .put(function(req, res) {
      Store.findById(req.params.store_id, function(err, foundStore) {
        if (err)
          return res.send(err);
        foundStore.name = req.body.name;
        foundStore.save(function(err) {
          if (err)
            return res.send(err);

          res.json({ message: 'store updated!' });
        });
      });
    })
    .delete(function(req, res) {
      Store.remove({
        _id: req.params.store_id
      }, function(err, store) {
        if (err)
          return res.send(err);

        res.json({ message: 'Store successfully deleted' });
        });
    });

    router.route('/stores/:store_id/users/:user_id')
     .put(function(req, res){
       Store.find({
         users: req.params.user_id
       }, function(err, store){
          if(err)
            console.log(err);
          if (store.length > 0){
            return res.json({message: 'This user already picked a ticket in this store!'});
          }else{
            Store.findByIdAndUpdate({
              _id: req.params.store_id
            }, {$push: {users: req.params.user_id}},
            {safe: true, upsert: true, new : true}, function (err, foundStore){
              if (err)
                return res.send(err);

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
                  return res.send(err);

                res.json({ message: 'User added to store queue!',  turn: userTurn});
              });
            });
          }
        })
      })
     .delete(function(req, res){
      Store.update({
        _id: req.params.store_id
      }, {$pull: {users: req.params.user_id}}, {multi: true},function(err, user) {
        if (err)
          return res.send(err);
        console.log(user);
        res.json({ message: 'Successfully deleted' });
        });
    });

    router.route('/stores/:store_id/queue')
    .get(function(req, res){
      Store.findById(req.params.store_id, function(err, foundStore) {
        if (err)
          return res.send(err);

        res.json({queue: foundStore.users.length});
        });
    })

    router.route('/stores/:store_id/storeTurn')
    .get(function(req, res){
      Store.findById(req.params.store_id, function(err, foundStore) {
        if (err)
          return res.send(err);

        res.json({storeTurn: foundStore.storeTurn});
        });
    })
    // Avança el torn i elimina el ultim usuari de la llista
    .put(function(req, res){
      Store.findById(req.params.store_id , function (err, foundStore){
        if (err)
          return res.send(err);
        foundStore.storeTurn++;

        if (foundStore.storeTurn > config.stores.maxTurn)
          foundStore.storeTurn = 1;

        _async.parallel([
          function(cb) {
            Store.update({
              _id: req.params.store_id
            }, {$pull: {users: foundStore.users[0]}}, {multi: true},function(err, user) {
              if (err)
                return cb(err);

              console.log('First user removed from queue.');

              cb();
            });
          },

          function(cb) {
            foundStore.save(function(err) {
              cb(err);
            });
          }
        ],

        function(err) {
          if (err)
            return res.send(err);

          fcm.FCMNotificationBuilder()
            .setTopic('store.' + foundStore._id)
            .addData('storeTurn', foundStore.storeTurn)
            .addData('storeQueue',foundStore.users.length)
            .send(function(err, res) {
              if (err)
                console.log('FCM error:', err);
            });
            console.log(foundStore.users.length);
          res.json({ message: 'StoreTurn updated',  storeTurn: foundStore.storeTurn});
        });
      });
    });
}
