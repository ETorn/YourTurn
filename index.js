var l = require('debug')('etorn:index');
var l2 = require('debug')('etorn:mqtt');
l('WELCOME');

var im = require('istanbul-middleware'),
    isCoverageEnabled = (process.argv[2] == "coverage");

if (isCoverageEnabled) {
    l('Coverage activat! Executa els tests i mira /coverage');
    im.hookLoader(__dirname);
}

// BASE SETUP
// =============================================================================

var config = require('./config');

// Require dependencies
var mosca = require('mosca');
var mqtt = require('mqtt');
var express    = require('express');
var app        = express();
var cors = require("cors");

var mongoose   = require('mongoose');
l('Connecting to mongo...');
mongoose.connect('mongodb://' + config.mongodb.address + '/yourturn');
l('Connected.')

var server = new mosca.Server({
  http: {
     port: 1884,
     bundle: true,
     static: './'
  }
});

server.on('ready', setup);

// fired when a client is connected
server.on('clientConnected', function(client) {
  l2('Client connected: Client=%s', client.id);
});

// fired when a message is received
server.on('published', function(packet, client) {
  l2('Published: Topic=%s Payload=%s', packet.topic, packet.payload);
});

// fired when a client subscribes to a topic
server.on('subscribed', function(topic, client) {
  l2('Subscribed: Client=%s Topic=%s', client.id, topic);
});

// fired when a client subscribes to a topic
server.on('unsubscribed', function(topic, client) {
  l2('Unsubscribed: Client=%s Topic=%s', client.i, topic);
});

// fired when a client is disconnecting
server.on('clientDisconnecting', function(client) {
  l2('Disconnecting: Client=%s', client.id);
});

// fired when a client is disconnected
server.on('clientDisconnected', function(client) {
  l2('Disconnected: Client=%s', client.id);
});

// fired when the mqtt server is ready
function setup() {
    l2('Mosca listening on 1883');
}

var mqttClient = mqtt.connect(config.mqtt.address, {clientId: 'mqtt_local'});

// configure app to use bodyParser()
// this will let us get the data from a POST
var bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cors());

// ROUTES FOR OUR API
// =============================================================================
var router = express.Router();              // get an instance of the express Router

// REGISTER OUR ROUTES -------------------------------
require ('./routes/users') (router, mqttClient);
require ('./routes/stores') (router, mqttClient);
require ('./routes/supers') (router, mqttClient);
require ('./routes/totems') (router, mqttClient);
app.use('/', router);

if (isCoverageEnabled) {
    app.use('/coverage', im.createHandler());
}

// REGISTER OUR MIDDLEWARES -------------------------------
app.use(function(req, res, next) {
    res.status(404).send('Not Found');
    next(); // make sure we go to the next routes and don't stop here
});

app.use(function(err, req, res, next) {
  console.error(err.stack);
  res.status(500).send('Internal Server Error');
});


// START THE SERVER
// =============================================================================
app.listen(config.node.port);
l('Express listening on ' + config.node.port);
