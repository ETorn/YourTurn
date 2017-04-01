var l = require('debug')('etorn:routes:turns');
module.exports = function(router) {
  var Turn = require('../models/Turn');
  var User = require('../models/User');

  router.route('/turns')
    .post(function(req, res) {
      l('New Turn registration');
      var turn = new Turn();

      var userId;

      if (req.body.turn)
        turn.turn = req.body.turn;
      else
        return res.json({message: 'No store_id specified'})

      if (req.body.userId)
        userId = req.body.userId;
      else
        return res.json({message: 'No user_id specified'})

      if (req.body.storeId)
        turn.storeId = req.body.storeId;
      else
        return res.json({message: 'No store_id specified'})

        //Comprovem que no té torn en la parada corresponent
        User
          .findOne({_id: userId}, 'turns')
          .populate('turns')
          .exec(function (err, result) {
            if(err)
              res.json({message: err});

            if (result) {
              var storeIds = result.turns.map(function(t) {
                return t.storeId;
              });

              var turnFound = storeIds.indexOf(turn.storeId) !== -1;

              if (turnFound)
                return res.json({message: 'This turn already exists'});
            }
            // save the super and check for errors
            turn.save(function(err, newTurn) {
              if (err) {
                l('Turn save failed: %s', err);
                return res.json({message: err});
              }

              // save the totem and check for errors
              var user = new User();
              User.update({_id: userId}, {$push: {turns: turn._id}}, function (err, raw){
                if (err)
                  return res.json({message: err});

                l('Turn sucessfully saved (%s)', newTurn._id);
                res.json({ message: 'Turn created!', turnId: newTurn._id, userId: userId});
              });
            });
        });
    })
    .get(function(req, res) {
      l('GET /turns (get list of turns)')
      Turn.find(function(err, turn) {
        if (err) {
          l('Turn find failed: %s', err);
          return res.send(err);
        }

        res.json(turn);
      });
    });

  router.route('/turn/:turn_id')
    .get(function(req, res) {
      l('GET /turn/%s', req.params.turn_id);
      Turn.findById(req.params.turn_id, function(err, turn) {
        if (err) {
          l('Turn not found (%s): %s', req.params.turn_id, err);
          return res.send(err);
        }

        res.json(turn);
      });
    })
    .delete(function(req, res) {
      l('DELETE /turn/%s', req.params.turn_id)
      Turn.remove({
        _id: req.params.turn_id
      }, function(err, turn) {
        if (err) {
          l('Turn removal failed (%s): %s', req.params.turn_id, err)
          return res.send(err);
        }

        l('Turn successfully removed (%s)', req.params.turn_id);
        res.json({ message: 'Successfully deleted' });
      });
    });
}
