const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const schema = new Schema({
    name:{type: String, required: true}, 
    owner: {type: String}, //username
    //partner: {type: String}, //another username
    housePlan: {type: String, default: "/default.svg"}, //svg
    housePlanName: {type: String, default: "default"}, //svg
    rooms:{type: Object}, //center: (x, y), corners: [(x1, y1), (x2, y2) ...]'
    ref:{type: Object}
});

schema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('House', schema);