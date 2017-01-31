var mongoose     = require('mongoose');
var Schema       = mongoose.Schema;

var SuperSchema   = new Schema({
    name: String,
    address: String,
    phone: String,
    fax: String,
    stores: [{type: Schema.ObjectId, ref: "Store"}]
    //wifi: String,
    //coordinates: String
});

module.exports = mongoose.model('Super', SuperSchema);
