var config = require('../config');
var request = require('request');
var fs = require('fs');
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

  for (var i = 0; i < json.supers.length; i++) {
    var aSuper = json.supers[i];

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

      for (var i = 0; i < aSuper.stores.length; i++) {
        var store = aSuper.stores[i];

        request({
          url: config.node.address + "/stores",
          method: 'POST',
          json: true,
          body: {
            name: store.name,
            superId: aSuper.id
          }
        }, function(err, res, body) {
          if (err || res.statusCode != 200) {
            console.log(err);
            return;
          }

          process.stdout.write('s');
        });
      }
    });
  }
});
