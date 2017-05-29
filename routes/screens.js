var l = require('debug')('etorn:routes:screens');

//Screen Routes
module.exports = function(router) {
  var Screen = require('../models/Screen');
  var Store = require('../models/Store');

  router.route('/screens')
    .post(function(req, res) {
      l('New screen registration');
      var screen = new Screen();

      var storeId;
      if (req.body.identifier)
        screen.identifier = req.body.identifier;

      if (req.body.storeId) {
        storeId = req.body.storeId;
        screen.storeId = req.body.storeId;
      }
      else
        return res.json({message: 'No store_id specified'})

        Store
          .findOne({_id: storeId})
          .exec(function (err, result) {
            if(err)
              res.json({message: err});

            var screenIdentifiers = result.screens.map(function(s) {
              return s.identifier;
            });

            var screenFound = screenIdentifiers.indexOf(screen.identifier) !== -1;

            if (screenFound)
              return res.json({message: 'This screen already exists'});

            // save the screen and check for errors
            screen.save(function(err, newScreen) {
              if (err) {
                l('screen save failed: %s', err);
                return res.json({message: err});
              }

              // save the screen and check for errors
              Store.update({_id: storeId}, {$push: {screens: newScreen._id}}, function (err, raw){
                if (err)
                  return res.json({message: err});

                l('Screen sucessfully saved (%s)', newScreen._id);
                res.json({ message: 'Screen created!', screenId: newScreen._id, storeId: storeId});
              });
            });
        });
    })
    .get(function(req, res) {
      l('GET /screens (get list of screens)')
      Screen.find(function(err, screen) {
        if (err) {
          l('Screen find failed: %s', err);
          return res.send(err);
        }

        res.json(screen);
      });
    });

  router.route('/screens/identifier/:screenidentifier')
  .get(function(req, res) {
    Screen.findOne({identifier: req.params.screenidentifier},  function(err, screen) {
      if (err)
        return res.send(err);

      res.json({screen: screen});
    });
  });

  router.route('/screens/:screen_id')
    .get(function(req, res) {
      l('GET /screens/%s', req.params.screen_id);
      Screen.findById(req.params.screen_id, function(err, screen) {
        if (err) {
          l('screen not found (%s): %s', req.params.screen_id, err);
          return res.send(err);
        }

        res.json(screen);
      });
    })
    .delete(function(req, res) {
      l('DELETE /screens/%s', req.params.screen_id)
      Screen.remove({
        _id: req.params.screen_id
      }, function(err, screen) {
        if (err) {
          l('Screen removal failed (%s): %s', req.params.screen_id, err)
          return res.send(err);
        }

        l('Screen successfully removed (%s)', req.params.screen_id);
        res.json({ message: 'Successfully deleted' });
      });
    });
}
