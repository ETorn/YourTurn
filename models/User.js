var mongoose     = require('mongoose');
var Schema       = mongoose.Schema;

var UserSchema   = new Schema({
    firebaseId: String,
    turn: Number
});

module.exports = mongoose.model('User', UserSchema);
