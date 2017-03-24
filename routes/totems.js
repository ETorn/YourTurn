//Totem Routes
module.exports = function(router) {
  var Totem = require('../models/Totem');
  var Super = require('../models/Super');

  router.route('/totems')
    .post(function(req, res) {
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

        Super.findOne({_id: superId})

        .exec(function (err, result) {
          if(err)
            console.log(err);

        var totemIdentifiers = result.totems.map(function(t) {
          return t.identifier;
        });

        var totemFound = totemIdentifiers.indexOf(totem.identifier) !== -1;

        if (totemFound){
          return res.json({message: 'This totem already exists'});
        }else{
          // save the super and check for errors
          totem.save(function(err, newTotem) {
            if (err)
              return res.send(err);

            // save the totem and check for errors
            var supermrkt = new Super();
            Super.update({_id: superId}, {$push: {totems: totem._id}}, function (err, raw){
              if (err)
                return res.send(err);

              res.json({ message: 'Totem created!', totemId: newTotem._id, superId: superId});
            });
          });
        }
      });
    })
    .get(function(req, res) {
      Totem.find(function(err, totem) {
        if (err)
          return res.send(err);

        res.json(totem);
      });
    });

  .get(function(req, res) {
      if (err)
        return res.send(err);

      res.json({superId: totem.superId});
    });
  });

  router.route('/totems/:totem_id')
    .get(function(req, res) {
      Totem.findById(req.params.totem_id, function(err, totem) {
        if (err)
          return res.send(err);

        res.json(totem);
      });
    })
    .delete(function(req, res) {
      Totem.remove({
        _id: req.params.totemid
      }, function(err, totem) {
        if (err)
          return res.send(err);

        res.json({ message: 'Successfully deleted' });
      });
    });
}
