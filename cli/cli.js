var _async = require('async');
var config = require('../config');
var program = require('commander');
var request = require('request');

program
  .version('0.0.1')
  .description('Cli per interactuar amb el servidor desde la consola.')
  .command('list', 'Mostra una llista de supers')
  .command('advance [storeId]', 'Avança torn a les parades')
  .command('user', 'Simula usuaris')
  ;

program.parse(process.argv);
