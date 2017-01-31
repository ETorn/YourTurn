//User Routes
module.exports = function(router) {
  var Store = require('../models/Store');

  router.route('/stores')
    // create a user (accessed at POST http://localhost:8080/users)
    .post(function(req, res) {
      var store = new Store();      // create a new instance of the User model
        store.name = req.body.name;  // set the users turn (comes from the request)
        store.users = [];

        // save the user and check for errors
        store.save(function(err) {
          if (err)
            return res.send(err);

          res.json({ message: 'Store created!' });
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
      }, function(err, user) {
        if (err)
          return res.send(err);

        res.json({ message: 'Successfully deleted' });
        });
    });

    router.post('/stores/:store_id/addUser/:user_id', function(req, res){
      // save the user and check for errors
      Store.update({_id: req.params.store_id}, {$push: {users: req.params.user_id}}, function (err, raw){
        if (err)
          return res.send(err);

        res.json({ message: 'User created in store!' });
      });
    });
}
