var config = require('../config');
var request = require('request');
var program = require('commander');
var _async = require('async');

var getFirstStoreId = require('./get-first-store-id');

var advanceStoreTurn = function advanceStoreTurn(storeId, cb) {
  request({
    url: config.node.address + "/stores/" + storeId + '/storeTurn',
    method: 'PUT',
    json: true
  }, function(err, res, body) {
    cb(err, body.storeTurn);
  });
};

program
  .version('0.0.1')
  .description('Avança torn a la primera store o a la especificada per argument')
  .arguments('[storeId]')
  .action(function(storeId) {
    STORE_ID = storeId;
  })
  ;

program.parse(process.argv);

var STORE_ID;

_async.series(
  [
    function(cb) {
      if (STORE_ID) return cb(null, STORE_ID);

      console.log('Buscant primera store del primer super ...');
      getFirstStoreId(function(err, sid){
        cb(err, sid);
      });
    }
  ],

  function(err, sid) {
    console.log('Avançant torn a "' + sid + '" ...');
    advanceStoreTurn(sid, function(err, turn) {
      console.log('Torn: ' + turn);
    });
  }
);
