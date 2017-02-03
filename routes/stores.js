//User Routes
module.exports = function(router) {
  var Store = require('../models/Store');

  router.route('/stores')
    .post(function(req, res) {
      var store = new Store();
      if (req.body.name)
        store.name = req.body.name;
        
      store.currentTurn = 0;

      //store.users = []; TODO Fase 3

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
    // get the user with that id (accessed at GET http://localhost:8080/users/:user_id)
    .get(function(req, res) {
      Store.findById(req.params.store_id, function(err, store) {
        if (err)
          return res.send(err);

        res.json(store);
        });
    })
    .put(function(req, res) {
    // use our user model to find the bear we want
      Store.findById(req.params.store_id, function(err, store) {
        if (err)
          return res.send(err);
        store.name = req.body.name;  // update the user info
        // save the user
        store.save(function(err) {
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

  /*router.route('/stores/:store_id/addUser/:user_id') TODO Fase 3
    .post(function(req, res) {
      // save the user and check for errors
      Store.update({_id: req.params.store_id}, {$push: {users: req.params.user_id}}, function (err, raw){
        if (err)
          return res.send(err);

        res.json({ message: 'User created in store!' });
      })
    })
    .delete(function(req, res) {
      Store.remove({
        _id: req.params.user_id
      }, function(err, user){
        if (err)
          return res.send(err);

        res.json({ message: 'User in store successfully deleted' });
      });
    });*/
}
