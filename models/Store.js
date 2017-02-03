var mongoose     = require('mongoose');
var Schema       = mongoose.Schema;

var StoreSchema   = new Schema({
    name: String,
    currentTurn: Number,
    //users: [{type: Schema.ObjectId, ref: "User"}] TODO Fase 3
    //idqr: String
});

module.exports = mongoose.model('Store', StoreSchema);
