var _async = require('async');
var config = require('../config');
var fs = require('fs');
var request = require('request');
var spawn = require('child_process').spawn;

var sourceFile = process.argv[2] || config.dataFile;

var resolve = function resolve(str) {
  return str.replace(/%([^%]+)%/g, function(_,n) {
    return process.env[n];
  });
};

var mongoRoute = resolve('%ProgramFiles%\\MongoDB\\Server\\3.4\\bin\\mongo.exe');

console.log('Clearing database...');
var prc = spawn(mongoRoute,  ['yourturn', '--eval', 'db.dropDatabase()']);

prc.on('close', function(){

  console.log('Done. Loading supers and Stores...')
  var json = JSON.parse(fs.readFileSync(sourceFile, 'utf8'));

  _async.eachSeries(json.supers, function(aSuper, cb) {
    request({
      url: config.node.address + "/supers",
      method: 'POST',
      json: true,
      body: {
        address: aSuper.address,
        phone: aSuper.phone,
        fax: aSuper.fax,
        city: aSuper.city,
        location: aSuper.location
      }
    }, function(err, res, body) {
      if (err || res.statusCode != 200) {
        console.log(err);
        return;
      }

      process.stdout.write('S');

      aSuper.id = body.id;

      _async.eachSeries(aSuper.stores, function(store, cb2) {
        request({
          url: config.node.address + "/stores",
          method: 'POST',
          json: true,
          body: {
            name: store.name,
            superId: aSuper.id
          }
        }, function(err, res, newStore) {
          if (err || res.statusCode != 200) {
            console.log(err);
            return;
          }

          request({
            url: config.node.address + "/screens",
            method: 'POST',
            json: true,
            body: {
              identifier: store.screen,
              storeId: newStore.storeId
            }
          }, function(err, res, body) {
            if (err || res.statusCode != 200) {
              console.log(err);
              return;
            }

            process.stdout.write('p');
            
          });

          process.stdout.write('s');

          cb2();
        });
      },
      function(err) {cb(err);})

      _async.eachSeries(aSuper.totems, function(totem, cb2) {
        request({
          url: config.node.address + "/totems",
          method: 'POST',
          json: true,
          body: {
            identifier: totem.identifier,
            superId: aSuper.id
          }
        }, function(err, res, body) {
          if (err || res.statusCode != 200) {
            console.log(err);
            return;
          }

          process.stdout.write('s');

          cb2();
        });
      });
    });
  }, function(err) {
    console.log();
    console.log('Done');
  });
});
