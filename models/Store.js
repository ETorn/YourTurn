var mongoose     = require('mongoose');
var Schema       = mongoose.Schema;

var StoreSchema   = new Schema({
    name: String,
    users: [{type: Schema.ObjectId, ref: "User"}],
    screens: [{type: Schema.ObjectId, ref: "Screen"}],
    storeTurn: Number,
    usersTurn: Number,
    aproxTime: Number
});

module.exports = mongoose.model('Store', StoreSchema);
