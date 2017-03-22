var im = require('istanbul-middleware'),
    isCoverageEnabled = (process.argv[2] == "coverage");

if (isCoverageEnabled) {
    console.log('Coverage activat! Executa els tests i mira /coverage');
    im.hookLoader(__dirname);
}

// BASE SETUP
// =============================================================================

var config = require('./config');

// Require dependencies
var express    = require('express');
var app        = express();
var cors = require("cors");

var mongoose   = require('mongoose');
mongoose.connect('mongodb://' + config.mongodb.address + '/yourturn');


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
require ('./routes/users') (router);
require ('./routes/stores') (router);
require ('./routes/supers') (router);
require ('./routes/totems') (router);
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
console.log('Magic happens on port ' + config.node.port);
