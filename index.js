// BASE SETUP
// =============================================================================

var config = require('./config');

// Require dependencies
var User       = require('./models/User');
var Super      = require('./models/Super');
var Store      = require('./models/Store');
var express    = require('express');
var app        = express();

var mongoose   = require('mongoose');
mongoose.connect('mongodb://' + config.mongodb.address + '/yourturn');


// configure app to use bodyParser()
// this will let us get the data from a POST
var bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// ROUTES FOR OUR API
// =============================================================================
var router = express.Router();              // get an instance of the express Router

// REGISTER OUR ROUTES -------------------------------
require ('./routes/users.js') (router);
require ('./routes/stores.js') (router);
require ('./routes/supers.js') (router);
app.use('/', router);


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
app.listen(8080);
console.log('Magic happens on port ' + 8080);
