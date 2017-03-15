//Totem Routes
module.exports = function(router) {
  var Totem = require('../models/Totem');

  router.route('/totems')
    .post(function(req, res) {
      var totem = new Totem();
      totem.save(function(err, t) {
        if (err)
          return res.send(err);

        res.json({ message: 'Totem created!', totemId: t.id});
      });
    })
    .get(function(req, res) {
      Totem.find(function(err, totem) {
        if (err)
          return res.send(err);

        res.json(totem);
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
