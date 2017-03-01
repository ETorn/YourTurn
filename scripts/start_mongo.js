var spawn = require('child_process').spawn;

var resolve = function resolve(str) {
  return str.replace(/%([^%]+)%/g, function(_,n) {
    return process.env[n];
  });
};

var mongoRoute = resolve('%ProgramFiles%\\MongoDB\\Server\\3.4\\bin\\mongod.exe');
var dbRoute = resolve('%HOMEPATH%\\Documents\\Programming\\e-Torn\\DB');

var prc = spawn(mongoRoute,  ['--dbpath', dbRoute]);

prc.stdout.setEncoding('utf8');
prc.stdout.on('data', function (data) {
    console.log(data);
});

prc.on('close', function (code) {
    console.log('process exit code ' + code);
});

process.on('SIGINT', function(code, signal) {
  prc.kill('SIGINT');
});
