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
    cart_distance: Number,
    now_lat: {                  // Save의 now_lat를 외래키로 가져왔다.
        type: ObjectId,
        ref: 'Socket'
    },
    now_lng: {                  // Save의 now_lng를 외래키로 가져왔다.
        type: ObjectId,
        ref: 'Socket'
    },
});

module.exports = mongoose.model('Status', statusSchema);