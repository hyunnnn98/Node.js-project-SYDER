const mongoose = require('mongoose');

const { Schema } = mongoose;
const { Types: { ObjectId } } = Schema;
const statusSchema = new Schema({
    cart_id: {
        type: Number,
        required: true,
        index: true,            // 빠르게 찾기 위해 인덱스를 걸어줌.
    },
    cart_status: {              // 차량의 상태를 4단계로 설정 
        type: Number,           // 0 (운행 대기), 1 (운행 예약)
        default: 0,             // 2 (운행 중),   3 (이상 차량)
        max: 3,
    },
    route_id: Number,
    cart_battery: {
        type: Number,
        max: 100,
        required: true,
    },
    wapoint_path: Number,
    now_lat: Number,
    now_lng: Number
});

module.exports = mongoose.model('Status', statusSchema);