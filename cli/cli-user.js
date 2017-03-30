var _async = require('async');
var config = require('../config');
var program = require('commander');
var request = require('request');

var getFirstStoreId = require('./get-first-store-id');

var addUserToStore = function addUserToStore(userId, storeId, cb) {
  request({
    url: config.node.address + "/stores/" + storeId + '/users/' + userId,
    method: 'PUT',
    json: true
  }, function(err, res, body) {
    cb(err, body);
  });
}

program
  .version('0.0.1')
  .description('Simula accions d\'usuaris')
  ;

program
  .command('requestTurn [storeId]')
  .alias('r')
  .description('Demana torn a la primera store o a la especificada')
  .option('-i, --id <id>', 'Especifica la id de firebase a fer servir')
  .action(function(storeId, options) {
    var firebase = options.id || 'firebase:cli';

    console.log('Fent servir la id de firebase \'' + firebase + '\'');

    _async.series(
      [
        function(cb) {
          if (storeId) return cb(null, storeId);

          console.log('Buscant primera store del primer super ...');
          getFirstStoreId(function(err, sid){
            cb(err, sid);
          });
        }
      ],

      function(err, sid) {
        console.log('Demanant torn a "' + sid + '" ...');
        addUserToStore(firebase, sid, function(err, body) {
          if (err)
            return console.log(err);
          if (body.turn)
            console.log('Torn usuari: ' + body.turn);
          else
            console.log(body.message);
        });
      }
    );
  })
  ;

program.parse(process.argv);
