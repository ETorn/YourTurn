module.exports = function(router) {
  var Super = require('../models/Super');
  var _async = require('async');
  var geolib = require('geolib');

  router.route('/supers')
    .post(function(req, res) {
      var superM = new Super();
      if (req.body.address)
        superM.address = req.body.address;
      if (req.body.city)
        superM.city = req.body.city;
      if (req.body.phone)
        superM.phone = req.body.phone;
      if (req.body.fax)
        superM.fax = req.body.fax;

      superM.stores = [];

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
      // var populateQuery = [{path:'stores'}, {path:'location'}];
      var populateQuery = [{path:'stores'}];
      Super.find()
      .populate(populateQuery)
      .exec(function(err, supers) {
        if (err)
          return res.send(err);

        res.json(supers);
      });
    });

  router.get('/supers/coords', function(req, res){
    // var loc = require('../location');
    // loc.findLocation(req, res);

    var maxDistance = req.query.distance || 1000;  // Metres. 1km default

    var coords = {
      latitude: req.query.latitude,
      longitude: req.query.longitude
    }

    var latitudeUpper = geolib.computeDestinationPoint(coords, maxDistance, 0).latitude;
    var latitudeLower = geolib.computeDestinationPoint(coords, maxDistance, 180).latitude;
    var longitudeUpper = geolib.computeDestinationPoint(coords, maxDistance, 90).longitude;
    var longitudeLower = geolib.computeDestinationPoint(coords, maxDistance, 270).longitude;

    Super
      .find({
        "location.lat": {$gt: latitudeLower, $lt: latitudeUpper},
        "location.long": {$gt: longitudeLower, $lt: longitudeUpper}
      })
      .exec(function(err, supers) {
        if (err)
          return res.send(err);

        res.send(supers);
      });
  });

  router.route('/supers/:super_id')
    .get(function(req, res) {
      Super.findById(req.params.super_id, function(err, superM) {
        if (err)
          return res.send(err);

        res.json(superM);
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
}
