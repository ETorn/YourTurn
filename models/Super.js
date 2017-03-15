var mongoose     = require('mongoose');
var Schema       = mongoose.Schema;

var SuperSchema   = new Schema({
    name: String,
    address: String,
    phone: String,
    fax: String,
    stores: [{type: Schema.ObjectId, ref: "Store"}],
    totems: [{type: Schema.ObjectId, ref: "Totems"}]
    //wifi: String,
    //coordinates: String
});

var SuperModel = mongoose.model('Super', SuperSchema);
module.exports = SuperModel;
