const mongoose = require('mongoose');

const { Schema } = mongoose;
const { Types: { ObjectId } } = Schema;
const statusSchema = new Schema({
    carNumber: {
        type: Number,
        unique: true,
    },
    car_info: {
        status: {
            type: Number,
            required: true,
        },
        lat: {
            type: Number,
            required: true,
        },
        lng: {
            type: Number,
            required: true,
        },
        battery: {
            type: Number,
            max: 100,
            required: true,
        },
        distance: Number,
    },
    call: {
        start_point: {
            type: String,
        },
        end_point: {
            type: String,
        },
        time: Number,
    },
    token: {
        sender: {
            type: String,
        },
        receiver: {
            type: String,
        },
    },
    path: {
        path_id: {
            type: Number,
        },
        path_way: {
            type: Number,
        }
    },
    createdAt: {
        type: Date,
        default: Date.now,
    }
});

module.exports = mongoose.model('Status', statusSchema, 'car_table');

