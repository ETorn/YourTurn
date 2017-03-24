var mongoose     = require('mongoose');
var Schema       = mongoose.Schema;

var TotemSchema  = new Schema({
  identifier: String
});

module.exports = mongoose.model('Totem', TotemSchema);
