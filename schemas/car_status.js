const mongoose = require('mongoose');

const { Schema } = mongoose;
const { Types: { ObjectId } } = Schema;
const statusSchema = new Schema({
    car_id: {
        type: String,
        unique: true,
    },
    car_battery: {
        type: Number,
        // max: 100,
        // required: true,
    },
    waypoint_start :{
        type: String,
        // required: true
    },
    waypoint_end: {
        type: String,
        // required: true
    },
    distance: Number,
    delivery_time: Number,
    path: {
        type: Array
    },
    createdAt: {
        type: Date,
        default: Date.now,
    }
});

module.exports = mongoose.model('Status', statusSchema, 'car_table');

