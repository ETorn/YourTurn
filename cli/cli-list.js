var config = require('../config');
var request = require('request');
var program = require('commander');
var _async = require('async');

var getSupers = function getSupers(coords, distance, cb) {

  var query = '';

  if (coords || distance)
    query += '?';

  if (coords)
    query += 'latitude=' + coords[0] + '&longitude=' + coords[1];

  if (coords && distance)
    query += '&';

  if (distance)
    query += 'distance=' + distance;

  request({
    url: config.node.address + "/supers" + query,
    method: 'GET',
    json: true
  }, function(err, res, body) {
    cb(err, body)
  });
};

var cleanStore = function cleanStore(s) {
  var newS = {
    id: s._id,
    name: s.name,
    storeTurn: s.storeTurn,
    usersTurn: s.usersTurn
  };

  if (s.users.length > 0)
    newS.users = s.users;

  return newS;
};

var cleanSuper = function(s) {
  var newS = {
    id: s._id,
    address: s.address,
    city: s.city,
    phone: s.phone,
    location: s.location
  };

  if (s.distance > 0)
    newS.distance = s.distance;

  if (s.stores.length > 0)
    newS.stores = s.stores.map(cleanStore);

  return newS;
};

program
  .version('0.0.1')
  .description('Mostra informació sobre els supers')
  .option('-c, --coordinates <lat>,<long>', 'Limita la cerca per coordenades', function(c) {
    return c
      .split(',')
      .map(function(v){return v.trim()})
      .map(Number)
      ;
  })
  .option('-d, --distance <n>', 'Limita la cerca per distància', function(d) {
    return Number(d);
  })
  .option('-A, --show-all', 'Mostra tots els resultats encara que n\'hi hagi molts')
  ;

program.parse(process.argv);

getSupers(program.coordinates, program.distance, function(err, res) {

  console.log(res.length + ' supers trobats.');

  if (res.length > 5 && !program.A) {
    console.log('Més de 5 supers trobats. No es mostraran.');
    console.log('Per mostrarlos fes servir una opcio -d mes petita')
    console.log('o utilitza -A per sobrepassar aquest check.');
    return;
  }

  console.log();

  res
    .map(cleanSuper)
    .map(function(s){return JSON.stringify(s, null, 2)})
    .map(function(s){console.log(s)});
});
