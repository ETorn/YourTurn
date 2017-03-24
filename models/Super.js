var mongoose     = require('mongoose');
var Schema       = mongoose.Schema;

var SuperSchema   = new Schema({
    address: String,
    city: String,
    phone: String,
    fax: String,
    stores: [{type: Schema.ObjectId, ref: "Store"}],
    totems: [{type: Schema.ObjectId, ref: "Totem"}],
    location: {
      lat: Number,
      long: Number
    }
    //wifi: String,
});

var SuperModel = mongoose.model('Super', SuperSchema);
module.exports = SuperModel;
