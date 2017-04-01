var mongoose     = require('mongoose');
var Schema       = mongoose.Schema;

var UserSchema   = new Schema({
    firebaseId: String,
    turn: Number,
    turns: [{type: Schema.ObjectId, ref: "Turn"}]
});

module.exports = mongoose.model('User', UserSchema);
