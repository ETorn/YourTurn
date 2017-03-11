var config = require('./config');
var request = require('request');
var program = require('commander');
var _async = require('async');

program
  .version('0.0.1')
  .description('Cli per interactuar amb el servidor desde la consola.')
  ;

program
  .command('advance [storeId]')
  .description('Avança un torn a la tenda especificada.')
  .action(function(storeId) {
    _async.series(
      [
        function(cb) {
          if (storeId) return cb(null, storeId);

          console.log('Buscant primera store del primer super ...');

          request({
            url: config.node.address + "/supers",
            method: 'GET',
            json: true
          }, function(err, res, body) {
            var storeId = body[0].stores[0]._id;

            cb(null, storeId);
          });
        }
      ],

      function(err, res) {
        var storeId = res[0];

        console.log('Avançant torn a "' + storeId + '" ...');

        request({
          url: config.node.address + "/stores/" + storeId + '/storeTurn',
          method: 'PUT',
          json: true
        }, function(err, res, body) {
          if (err) {
            console.log('Error:');
            console.log(err);
            console.log(res);
            return;
          }
          
          console.log('Torn: ' + body.storeTurn);
        });
      }
    );
  })
  ;

program.parse(process.argv);
