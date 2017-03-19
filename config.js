module.exports = {
  mongodb: {
    address: 'localhost'
  },
  node: {
    port: 8080,
    address: 'http://localhost:8080'  //El port ha de coincidir amb la linia anterior
  },
  stores: {
    maxTurn: 99
  },
  supers: {
    defaultDistance: 1500
  },
  dataFile: 'config/basedata.json'
};
