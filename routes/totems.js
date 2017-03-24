var l = require('debug')('etorn:routes:totems');

//Totem Routes
module.exports = function(router) {
  var Totem = require('../models/Totem');
  var Super = require('../models/Super');

  router.route('/totems')
    .post(function(req, res) {
      l('New totem registration');
      var totem = new Totem();

      var superId;
      if (req.body.identifier)
        totem.identifier = req.body.identifier;

      if (req.body.superId) {
        superId = req.body.superId;
        totem.superId = req.body.superId;
      }
      else
        return res.json({message: 'No super_id specified'})

        Super
          .findOne({_id: superId})
          .exec(function (err, result) {
            if(err)
              res.json({message: err});

            var totemIdentifiers = result.totems.map(function(t) {
              return t.identifier;
            });

            var totemFound = totemIdentifiers.indexOf(totem.identifier) !== -1;

            if (totemFound)
              return res.json({message: 'This totem already exists'});

            // save the super and check for errors
            totem.save(function(err, newTotem) {
              if (err) {
                l('Totem save failed: %s', err);
                return res.json({message: err});
              }

              // save the totem and check for errors
              var supermrkt = new Super();
              Super.update({_id: superId}, {$push: {totems: totem._id}}, function (err, raw){
                if (err)
                  return res.json({message: err});

                l('Totem sucessfully saved (%s)', t.id);
                res.json({ message: 'Totem created!', totemId: newTotem._id, superId: superId});
              });
            });
        });
    })
    .get(function(req, res) {
      l('GET /totems (get list of totems)')
      Totem.find(function(err, totem) {
        if (err) {
          l('Totem find failed: %s', err);
          return res.send(err);
        }

        res.json(totem);
      });
    });

  router.route('/totems/:totemidentifier')
  .get(function(req, res) {
    Totem.findOne({identifier: req.params.totemidentifier},  function(err, totem) {
      if (err)
        return res.send(err);

      res.json({superId: totem.superId});
    });
  });

  router.route('/totems/:totem_id')
    .get(function(req, res) {
      l('GET /totems/%s', req.params.totem_id);
      Totem.findById(req.params.totem_id, function(err, totem) {
        if (err) {
          l('Totem not found (%s): %s', req.params.totem_id, err);
          return res.send(err);
        }

        res.json(totem);
      });
    })
    .delete(function(req, res) {
      l('DELETE /totems/%s', req.params.totem_id)
      Totem.remove({
        _id: req.params.totemid
      }, function(err, totem) {
        if (err) {
          l('Totem removal failed (%s): %s', req.params.totem_id, err)
          return res.send(err);
        }

        l('Totem successfully removed (%s)', req.params.totem_id);
        res.json({ message: 'Successfully deleted' });
      });
    });
}
