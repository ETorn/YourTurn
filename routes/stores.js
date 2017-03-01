
var config = require('../config');

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

        store.storeTurn = 1;
        store.usersTurn = 1;
        store.users = [];

        // save the user and check for errors
        Store.findOne({name : store.name}, function (err, storeM) {
          if(err)
            console.log(err);
          if (storeM){
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

          res.json(stores);
        });
      });

  router.route('/stores/:store_id')
    .get(function(req, res) {
      Store.findById(req.params.store_id, function(err, foundStore) {
        if (err)
          return res.send(err);

        res.json(foundStore);
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
   .post(function(req, res){
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

        foundStore.save(function(err) {
          if (err)
            return res.send(err);

          res.json({ message: 'User added to store queue!',  turn: userTurn});
        });
      });
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
    .put(function(req, res){
      Store.findById(req.params.store_id , function (err, foundStore){
        if (err)
          return res.send(err);
        foundStore.storeTurn++;

        if (foundStore.storeTurn > config.stores.maxTurn)
          foundStore.storeTurn = 1;

        foundStore.save(function(err) {
          if (err)
            return res.send(err);

          res.json({ message: 'StoreTurn updated',  storeTurn: foundStore.storeTurn});
        });
      });
    })
}
