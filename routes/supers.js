var geolib = require('geolib');
var l = require('debug')('etorn:routes:supers');
var _async = require('async');

var computeStoresQueue = function computeStoresQueue(s) {
  _async.map(s.stores, function(el, cb) {
    el.queue = el.users.length;
    cb(null, el);
  }, function(err, stores) {
    s.stores = stores;
  });
  return s;
}

var addDistance = function addDistance(s, req) {

  // Si no hi ha coordenades distancia = 0
  if (!req.query.latitude || !req.query.longitude) {
    s.distance = 0;
    return s;
  }

  var coords = {
    latitude: req.query.latitude,
    longitude: req.query.longitude
  };

  var superCoords = {
    latitude: s.location.lat,
    longitude: s.location.long
  };

  s.distance = geolib.getDistance(coords, superCoords, 10);

  return s;
};

module.exports = function(router) {
  var Super = require('../models/Super');
  var Totem = require('../models/Totem');

  var _async = require('async');
  var _ = require('lodash');

  router.route('/supers')
    .post(function(req, res) {
      l('New super registration');

      var superM = new Super();

      var missingProps = [];

      if (req.body.address)
        superM.address = req.body.address;
      else
        missingProps.push('address');

      if (req.body.city)
        superM.city = req.body.city;
      else
        missingProps.push('city');

      if (req.body.phone)
        superM.phone = req.body.phone;
      else
        missingProps.push('phone');

      if (req.body.fax)
        superM.fax = req.body.fax;
      else
        missingProps.push('fax');

      if (req.body.location)
        superM.location = req.body.location;
      else
        missingProps.push('location');

      if (missingProps.length > 0) {
        l('Missing properties: %s', missingProps);
        return res.send({message: 'Missing properties: ' + missingProps.join(', ')});
      }

      superM.stores = [];
      superM.totems = [];

      Super.findOne({address: superM.address}, function (err, superMrk) {
          if(err) {
            l('Super find query failed: %s', err);
            return res.send(err);
          }

          if (superMrk){
            l('A super with this address already exists (%s)', superM.address);
            return res.json({message: 'This super already exists'});

          } else {
            superM.save(function(err, newSuper) {
              if (err) {
                l('Error saving new super: %s', err);
                return res.send(err);
              }

              l('Super saved successfully (%s)', newSuper.id);
              res.json({ message: 'Super created!', id: newSuper.id});
            });
          }
      });
    })
    .get(function(req, res) {
      l('Supers list requested');
      var populateQuery = [{path:'stores'}, {path: 'totems'}];

      var query = Super.find();

      if (req.query.latitude && req.query.longitude) {
        var maxDistance = req.query.distance || config.supers.defaultDistance;  // Metres. 1km default
        l('request contains location data. Result will be delimited');

        var coords = {
          latitude: req.query.latitude,
          longitude: req.query.longitude
        }

        var latitudeUpper = geolib.computeDestinationPoint(coords, maxDistance, 0).latitude;
        var latitudeLower = geolib.computeDestinationPoint(coords, maxDistance, 180).latitude;
        var longitudeUpper = geolib.computeDestinationPoint(coords, maxDistance, 90).longitude;
        var longitudeLower = geolib.computeDestinationPoint(coords, maxDistance, 270).longitude;

        query = Super.find({
          "location.lat": {$gt: latitudeLower, $lt: latitudeUpper},
          "location.long": {$gt: longitudeLower, $lt: longitudeUpper}
        });
      }

      l('Querying mongo');
      query
      .populate(populateQuery)
      .exec(function(err, supers) {
        if (err) {
          l('Query failed: %s', err);
          return res.send(err);
        }

        // Afegim distancia a cada super
        var augmented = supers.map(function(s){
          return addDistance(s, req);
        });

        l('Returning %d results', augmented.length);
        res.json(_.sortBy(augmented,'distance'));
      });
    });

  router.route('/supers/:super_id')
    .get(function(req, res) {
      l('Request for super (%s)', req.params.super_id);
      Super.findById(req.params.super_id)
      .populate('stores')
      .lean()
      .exec(function(err, superM) {
        if (err) {
          l('Query failed: %s', err);
          return res.send(err);
        }
        superM = computeStoresQueue(superM);
        res.json(addDistance(superM, req));
      });
    })
    .put(function(req, res) {
      l('Updating super (%s)', req.params.super_id);
      var superUpdated = {};

      if (req.body.phone)
        superUpdated.phone = req.body.phone;
      if (req.body.fax)
        superUpdated.fax = req.body.fax;
      if (req.body.stores)
        superUpdated.stores = req.body.stores;
      if (req.body.totems)
        superUpdated.totems = req.body.totems;

      Super.update({_id: req.params.super_id}, superUpdated, function (err, raw){
        if (err) {
          l('Query failed: %s', err);
          return res.send(err);
        }

        l('Super updated successfully (%s)', req.params.super_id);
        res.json({ message: 'Super updated!' });
      });
    })
    .delete(function(req, res) {
      l('Deleting super (%s)', req.params.super_id);
      Super.remove({
        _id: req.params.super_id
      }, function(err, superM) {
        if (err) {
          l('Query failed: %s', err);
          return res.send(err);
        }

        l('Super successfully removed super (%s)', req.params.super_id);
        res.json({ message: 'Successfully deleted' });
      });
    });

  router.route('/supers/:super_id/totems')
  .get(function(req, res){
    l('Request totems for super (%s)', req.params.super_id);
    Super.findById(req.params.super_id, function(err, foundSupers) {
      if (err) {
        l('Query failed: %s', err);
        return res.send(err);
      }

      res.json({totems: foundSupers.totems});
    });
  });
}
