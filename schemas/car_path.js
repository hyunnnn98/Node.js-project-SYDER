const mongoose = require('mongoose');

const { Schema } = mongoose;
const { Types: { ObjectId } } = Schema;
const pathSchema = new Schema({
    path_id: {
        type: Number,
        unique: true,
    },
    start_point: {
        type: Number,
    },
    end_point: {
        type: Number,
    },
    travel_time: {
        type: Number,
    },
    travel_distance: {
        type: Number,
    },
    path_info: [
        {
            lat: { type: Number },
            lng: { type: Number }
        },
    ],
    createdAt: {
        type: Date,
        default: Date.now,
    }
});

module.exports = mongoose.model('Path', pathSchema, 'path_table');

