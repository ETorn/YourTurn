var mongoose     = require('mongoose');
var Schema       = mongoose.Schema;

var ScreenSchema  = new Schema({
  identifier: String,
  storeId: String
});

module.exports = mongoose.model('Screen', ScreenSchema);
