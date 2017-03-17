var fs = require('fs');
var request = require('request');
var es = require('event-stream');
var _ = require('lodash');

var URL = 'https://www.caprabo.com/system/modules/com.caprabo.mrmmccann.caprabocom.formatters/resources/js/localizador.js';

var outFile = process.argv[2] || 'config/caprabodata.json';

var pairs = [];

console.log('Fetching data...');
request(URL)
  .on('response', function(res) {
    console.log('Downloading...');
  })
  .pipe(es.split())
  .pipe(es.map(function (line, cb) {
    line = line.trim();

    var matchResult = /supermarket\[\"(\w+)\"\] = \"(.*?)\"/.exec(line)

    if (matchResult) {
      var obj = {key: matchResult[1], value: matchResult[2]};

      pairs.push(obj);

      cb(null, JSON.stringify(obj) + '\n');

    } else
      cb();

  }))
  .on('end', function() {
    console.log('Read ' + pairs.length + ' lines.');

    var result = _(pairs)
      .chunk(14)
      .map(function(arr) {
        return _.reduce(arr, function(o, p) {
          return _.set(o, p.key, p.value);
        }, {});
      })
      .map(function(o) {
        var obj = {
          city: o.city,
          address: (function(a) {
              var m = /.*?(?=,)(, [\w]{0,4}(?=,))?/.exec(o.address);
              return (m) ? m[0] : a;
            })(o.address),
          phone: o.phone,
          fax: 'no-fax',
          location: {
            lat: o.latitude,
            long: o.longitude
          },
          stores: _(o).pickBy(function(v, k) {
              return k!=='parking'&&v==='y';
            })
            .flatMap(function(v, k) {
              return {name: k};
            })
            .value()
        };

        return obj;
      })
      .filter(function(o) {
        return o.stores.length > 0;
      })
      .value()
      ;

    console.log('After processing we have ' + result.length + ' supers.');

    console.log('Saving file...');
    fs.writeFile(outFile, JSON.stringify({supers: result}, null, 4), function(err) {
      console.log('Done.')
    });

  })
