var mongoose     = require('mongoose');
var Schema       = mongoose.Schema;

var TotemSchema  = new Schema({});

module.exports = mongoose.model('Totem', TotemSchema);
