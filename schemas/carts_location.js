const mongoose = require('mongoose');

const { Schema } = mongoose;
const { Types: { ObjectId } } = Schema;
const LocationSchema = new Schema({
    cart_id: {
        type: ObjectId,
        required: true,
        ref: "Status"
    },
    now_lat: {
        type: Number,
        required: true
    },
    now_lng: {
        type: Number,
        required: true
    },
    cart_distance: Number                   // allow null value
});

module.exports = mongoose.model('Location', LocationSchema);