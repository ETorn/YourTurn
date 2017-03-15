module.exports = function(router) {
  var Super = require('../models/Super');
  var Loc = require('../models/Location');
  var _async = require('async');


  router.route('/locations')
  .get(function(req, res) {
    Loc.find()
    .exec(function(err, locs) {
      if (err)
        return res.send(err);

      res.json(locs);
    });
  })
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

      var location = new Loc();
      if (req.body.loc) {
        location.loc = req.body.loc; //req sencera
        //superM.location = req.body.location;
      }

      Super.findOne({address: superM.address}, function (err, superMrk) {
          console.log(superMrk);
          if(err)
            console.log(err);
          if (superMrk){
            return res.json({message: 'This super already exists'});
          }else{
            var superId;
            _async.series([
              function(cb) {
              // save the location and check for errors
                location.save(function(err, newLoc) {
                if (err)
                  console.log(err);

                  superM.location = newLoc.id;

                  cb(null, newLoc.id);
                })
              },
              function(cb){
                // save the super and check for errors
                superM.save(function(err, newSuper) {
                  if (err)
                    console.log(err);
                    //return res.send(err);
                  //res.json({ message: 'Super created!', id: newSuper.id, super: newSuper});
                  var result = {};
                  result.locationId = superM.location;
                  result.superId = newSuper.id;
                  cb(null, result);
                });
              }
            ],
            function(err, result){
              console.log("super",result[1]);
              var locationUpdated = {};
              locationUpdated.superId = result[1].superId;

              // update the location
              Loc.update({_id: result[1].locationId}, locationUpdated, function (err, raw){
                if (err)
                  return res.send(err);
                  console.log(raw);
              });
              res.json({ message: 'Super created!', id: result[1].superId});
            });
          }
      });
    })
    .get(function(req, res) {
      var populateQuery = [{path:'stores'}, {path:'location'}];
      Super.find()
      .populate(populateQuery)
      .exec(function(err, supers) {
        if (err)
          return res.send(err);

        res.json(supers);
      });
    });

  router.get('/supers/coords', function(req, res){
    var loc = require('../location');
    loc.findLocation(req, res);
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
