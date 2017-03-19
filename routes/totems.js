var l = require('debug')('etorn:routes:totems');

//Totem Routes
module.exports = function(router) {
  var Totem = require('../models/Totem');

  router.route('/totems')
    .post(function(req, res) {
      l('New totem registration');
      var totem = new Totem();
      totem.save(function(err, t) {
        if (err) {
          l('Totem save failed: %s', err);
          return res.send(err);
        }

        l('Totem sucessfully saved (%s)', t.id);
        res.json({ message: 'Totem created!', totemId: t.id});
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
