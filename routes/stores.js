
module.exports = function(router) {
  var Store = require('../models/Store');

  router.route('/stores')
    .post(function(req, res) {
      var store = new Store();
        // save the store and check for errors
        if (req.body.name)
          store.name = req.body.name;
        store.storeTurn = 1;
        store.usersTurn = 1;
        store.users = [];

        // save the user and check for errors
        Store.findOne({name : store.name}, function (err, storeM) {
          console.log(storeM);
          if(err)
            console.log(err);
          if (storeM){
            return res.json({message: 'This store already exists'});
          }else{
            // save the super and check for errors
            store.save(function(err, newStore) {
              if (err)
                return res.send(err);
              res.json({ message: 'Store created!', id: newStore.id});
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

        foundStore.save(function(err) {
          if (err)
            return res.send(err);

          res.json({ message: 'User created in store!',  turn: userTurn});
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

    router.route('/stores/:store_id/usersTurn')
    .get(function(req, res){
      Store.findById(req.params.store_id, function(err, foundStore) {
        if (err)
          return res.send(err);

        res.json({userTurn: foundStore.usersTurn});
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

        foundStore.save(function(err) {
          if (err)
            return res.send(err);

          res.json({ message: 'StoreTurn updated',  storeTurn: foundStore.storeTurn});
        });
      });
    })
}
