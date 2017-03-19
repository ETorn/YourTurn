var config = require('../config');
var request = require('request');

module.exports = function getFirstStoreId(cb) {
  request({
    url: config.node.address + "/supers",
    method: 'GET',
    json: true
  }, function(err, res, body) {
    var storeId = body[0].stores[0]._id;

    cb(err, storeId);
  });
};
