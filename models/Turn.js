var mongoose     = require('mongoose');
var Schema       = mongoose.Schema;

var TurnSchema   = new Schema({
    storeId: String,
    userId: String,
    turn: Number
});

module.exports = mongoose.model('Turn', TurnSchema);
