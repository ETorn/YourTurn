var Loc      = require('./models/Location');
var Super = require('./models/Super');
var _async = require('async');
module.exports.findLocation = function(req, res) {
    //var limit = req.query.limit || 10;

    // get the max distance or set it to 1 kilometer
    var maxDistance = req.query.distance || 20;

    // we need to convert the distance to radians
    // the raduis of Earth is approximately 6371 kilometers
    maxDistance /= 6371;

    // get coordinates [ <longitude> , <latitude> ]
    var coords = [];
    coords[0] = req.query.longitude;
    coords[1] = req.query.latitude;

    _async.series([
      function(cb) {
        // find a location
        Loc.find({
          loc: {
            $near: coords,
            $maxDistance: maxDistance
          }
        })
        //.limit(limit)
        .exec(function(err, locations) {
          if (err) {
            console.log(err)
          }
          cb(null,locations);
        });
      }
    ],
    function(err, locations){
      var arrayId = locations[0].map(function(o){
        return o.superId;
      });
      var superIdArray = arrayId.filter(function(e){
        return !!e;
      });
      console.log(superIdArray);
      // save the super and check for errors
      Super.find({
        _id: {$in : superIdArray}
      })
      .exec(function(err, supers) {
        if (err)
          return res.send(err);
        res.json(supers);
      });
    });

}
