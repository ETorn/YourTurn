var mongoose     = require('mongoose');
var Schema       = mongoose.Schema;

var UserSchema   = new Schema({
    turn: Number,
});

module.exports = mongoose.model('User', UserSchema);
