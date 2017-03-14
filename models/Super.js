var mongoose     = require('mongoose');
var Schema       = mongoose.Schema;

var SuperSchema   = new Schema({
    address: String,
    city: String,
    phone: String,
    fax: String,
    stores: [{type: Schema.ObjectId, ref: "Store"}],
    location: {type: Schema.ObjectId, ref: "Location"}
    //wifi: String,
    //coordinates: String
});

var SuperModel = mongoose.model('Super', SuperSchema);
module.exports = SuperModel;
