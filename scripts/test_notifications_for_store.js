var _async = require('async');
var config = require('../config');
var request = require('request');

var storeId = process.argv[2];

var turns = 10;

var addUserToStore = function addUserToStore(userId, storeId, cb) {
  request({
    url: config.node.address + "/stores/" + storeId + '/users/' + userId,
    method: 'PUT',
    json: true
  }, function(err, res, body) {
    cb(err, body);
  });
};

var advanceStoreTurn = function advanceStoreTurn(storeId, cb) {
  request({
    url: config.node.address + "/stores/" + storeId + '/storeTurn',
    method: 'PUT',
    json: true
  }, function(err, res, body) {
    cb(err, body.storeTurn);
  });
};

_async.series([
    function(cb) {
      console.log("Afegint " + turns + " users a " + storeId);

      var letterArray = [];
      for (var i = 65; i < 65 + turns; i++) {
        letterArray.push(String.fromCharCode(i));
      }

      _async.eachSeries(letterArray, function(letter, cbb) {
        var userId = 'firebase:cl' + letter;

        addUserToStore(userId, storeId, function(err, res) {
          process.stdout.write(letter);
          cbb(null);
        });
      }, function(err) {
        console.log();
        cb(null);
      });
    },
    function(cb) {
      console.log('Subsciu-te a la store corresponent i apreta intro quan estiguis preparat');
      var stdin = process.stdin;
      stdin.setRawMode( true );
      stdin.setEncoding( 'utf8' );
      stdin.resume();
      stdin.on( 'data', function listener( key ){
        if ( key === '\r' ) {
          stdin.removeListener('data', listener);
          cb(null);
        }
      });
    },
    function(cb) {
      console.log("Avançant el torn " + turns + " vegades a " + storeId + " amb 1 segon de interval");
      var count = 0;
      _async.whilst(
        function() { return count < turns; },
        function(callback) {
          advanceStoreTurn(storeId, function(err) {
            process.stdout.write('.');
            count++;
            setTimeout(function() {
              callback(null, count);
            }, 1000);
          });
        },
        function (err, n) {
          console.log();
          cb(null);
        }
      );
    }
  ],
  function(err) {
    console.log("Done");
});
