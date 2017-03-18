var geolib = require('geolib');

var addDistance = function addDistance(s, req) {
  var s = s.toObject() || s;

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
  var _async = require('async');

  router.route('/supers')
    .post(function(req, res) {
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

      if (missingProps.length > 0)
        return res.send({message: 'Missing properties: ' + missingProps.join(', ')});

      superM.stores = [];
      superM.totems = [];

      if (req.body.location) {
        superM.location = req.body.location;
      }

      Super.findOne({address: superM.address}, function (err, superMrk) {
          if(err)
            console.log(err);

          if (superMrk){
            return res.json({message: 'This super already exists'});

          } else {
            superM.save(function(err, newSuper) {
              if (err)
                return res.send(err);

              res.json({ message: 'Super created!', id: newSuper.id});
            });
          }
      });
    })
    .get(function(req, res) {
      var populateQuery = [{path:'stores'}];

      var query = Super.find();

      if (req.query.latitude && req.query.longitude) {
        var maxDistance = req.query.distance || 1000;  // Metres. 1km default

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

      query
      .populate(populateQuery)
      .exec(function(err, supers) {
        if (err)
          return res.send(err);

        // Afegim distancia a cada super
        var augmented = supers.map(function(s){
          return addDistance(s, req);
        });

        res.json(augmented);
      });
    });

  router.route('/supers/:super_id')
    .get(function(req, res) {
      Super.findById(req.params.super_id, function(err, superM) {
        if (err)
          return res.send(err);

        res.json(addDistance(superM, req));
      });
    })
    .put(function(req, res) {
      var superUpdated = {};

      if (req.body.phone)
        superUpdated.phone = req.body.phone;
      if (req.body.fax)
        superUpdated.fax = req.body.fax;
      if (req.body.stores)
        superUpdated.stores = req.body.stores;

      // update the super
      Super.update({_id: req.params.super_id}, superUpdated, function (err, raw){
        if (err)
          return res.send(err);

        res.json({ message: 'Super updated!' });
      });
    })
    .delete(function(req, res) {
      Super.remove({
        _id: req.params.super_id
      }, function(err, superM) {
        if (err)
          return res.send(err);

        res.json({ message: 'Successfully deleted' });
        });
    });

  //Probablement es borrara en un futur
  router.post('/supers/:super_id/addStore/:store_id', function(req, res){
    // save the store and check for errors
    Super.update({_id: req.params.super_id}, {$push: {stores: req.params.store_id}}, function (err, raw){
      if (err)
        return res.send(err);

      res.json({ message: 'Store created in super!' });
    });
  });

  router.route('/supers/:super_id/totems')
  .get(function(req, res){
    Super.findById(req.params.super_id, function(err, foundSupers) {
      if (err)
        return res.send(err);

      res.json({totems: foundSupers.totems});
    });
  });

  router.route('/supers/:super_id/totems/:totem_id')
  .post(function(req, res){
    Super.findByIdAndUpdate({
      _id: req.params.super_id
    }, {$push: {totems: req.params.totem_id}},
    {safe: true, upsert: true, new: true}, function (err, foundSuper){
      if (err)
         return res.send(err);

      res.json({ message: 'Totem added to super!'});
    });
  })
  .delete(function(req, res){
    Super.update({
      _id: req.params.super_id
    }, {$pull: {totems: req.params.totem_id}}, {multi: true}, function(err, totem) {
      if (err)
        return res.send(err);

      res.json({ message: 'Successfully deleted totem'});
    });
  });
}
