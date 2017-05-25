module.exports = {
  mongodb: {
    address: 'localhost'
  },
  mqtt: {
    address: 'mqtt://localhost'
  },
  node: {
    port: 8080,
    address: 'http://localhost:8080'  //El port ha de coincidir amb la linia anterior
  },
  caesar: {
    port:8081,
    address: 'http://localhost:8081'  //El port ha de coincidir amb la linia anterior
  },
  stores: {
    maxTurn: 99
  },
  supers: {
    defaultDistance: 1500
  },
  dataFile: 'config/basedata.json'
};
