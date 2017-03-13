var Loc      = require('./models/Location');
module.exports.findLocation = function(req, res) {
    //var limit = req.query.limit || 10;

    // get the max distance or set it to 1 kilometer
    var maxDistance = req.query.distance || 1;

    // we need to convert the distance to radians
    // the raduis of Earth is approximately 6371 kilometers
    maxDistance /= 6371;

    // get coordinates [ <longitude> , <latitude> ]
    var coords = [];
    coords[0] = req.query.longitude;
    coords[1] = req.query.latitude;

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
        return res.json(500, err);
      }

      res.json(200, locations);
    });
}
