var mongoose     = require('mongoose');
var Schema       = mongoose.Schema;

var StoreSchema   = new Schema({
    name: String,
<<<<<<< HEAD
    users: [{type: Schema.ObjectId, ref: "User"}],
    storeTurn: Number,
    usersTurn: Number,
=======
    currentTurn: Number,
    //users: [{type: Schema.ObjectId, ref: "User"}] TODO Fase 3
>>>>>>> origin/master
    //idqr: String
});

module.exports = mongoose.model('Store', StoreSchema);
