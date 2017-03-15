//User Routes
module.exports = function(router) {
  var Super = require('../models/Super');

  router.route('/supers')
    .post(function(req, res) {
      var superM = new Super();
      if (req.body.name)
        superM.name = req.body.name;
      if (req.body.address)
        superM.address = req.body.address;
      if (req.body.phone)
        superM.phone = req.body.phone;
      if (req.body.fax)
        superM.fax = req.body.fax;

        superM.stores = [];
        superM.totems = [];

      Super.findOne({name : superM.name, address: superM.address}, function (err, superMrk) {
          console.log(superMrk);
          if(err)
            console.log(err);
          if (superMrk){
            return res.json({message: 'This super already exists'});
          }else{
            // save the super and check for errors
            superM.save(function(err, newSuper) {
              if (err)
                return res.send(err);
              res.json({ message: 'Super created!', id: newSuper.id});
            });
          }
      });
    })
    .get(function(req, res) {
      Super.find()
      .populate('stores')
      .exec(function(err, supers) {
        if (err)
          return res.send(err);

        res.json(supers);
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

  router.route('/supers/:super_id/totems')
  .get(function(req, res){
    Supers.findById(req.params.super_id, function(err, foundSupers) {
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
