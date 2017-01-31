var mongoose     = require('mongoose');
var Schema       = mongoose.Schema;

var UserSchema   = new Schema({
    turn: Number,
    date: Date
});

module.exports = mongoose.model('User', UserSchema);
