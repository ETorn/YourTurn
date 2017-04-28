var mongoose     = require('mongoose');
var Schema       = mongoose.Schema;

var UserSchema   = new Schema({
    firebaseId: String,
    turns: [{type: Schema.ObjectId, ref: "Turn"}],
    notificationTurns: Number
});

module.exports = mongoose.model('User', UserSchema);
