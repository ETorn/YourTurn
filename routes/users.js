//User Routes
module.exports = function(router) {
  var User = require('../models/User');

  router.route('/users')
    // create a user (accessed at POST http://localhost:8080/users)
    .post(function(req, res) {
      var user = new User();      // create a new instance of the User model
      user.firebaseId = req.body.firebaseId;
      User.findOne({firebaseId: req.body.firebaseId}, function (err, userFound) {
        if (userFound) {
          return res.json({message: 'This user already exists', userId: userFound.id});
        }
        else {
          // save the user and check for errors
          user.save(function(err, u) {
            if (err)
              return res.send(err);

            res.json({ message: 'User created!', userId: u.id});
          });
        }
      });
    })
    .get(function(req, res) {
      User.find(function(err, users) {
        if (err)
          return res.send(err);

        res.json(users);
      });
    });

  router.route('/users/:user_id')
    // get the user with that id (accessed at GET http://localhost:8080/users/:user_id)
    .get(function(req, res) {
      User.findById(req.params.user_id, function(err, user) {
        if (err)
          return res.send(err);

        res.json(user);
        });
    })
    .put(function(req, res) {
    // use our user model to find the bear we want
      User.findById(req.params.user_id, function(err, user) {
        if (err)
          return res.send(err);
        user.turn = req.body.turn;  // update the user info
        // save the user
        user.save(function(err) {
          if (err)
            return res.send(err);

          res.json({ message: 'user updated!' });
        });
      });
    })
    .delete(function(req, res) {
      User.remove({
        _id: req.params.userid
      }, function(err, user) {
        if (err)
          return res.send(err);

        res.json({ message: 'Successfully deleted' });
        });
    });

    router.route('/users/firebase/:firebase_id')
    .get(function(req, res) {
      User.findOne({firebaseId: req.params.firebase_id}, function (err, userFound) {
        if(err)
          console.log(err);
          if (userFound)
            return res.json({userId: userFound.id});
          res.json({message: 'User not found'});
      });
    });
}
