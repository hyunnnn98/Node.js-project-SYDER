const mongoose = require('mongoose');

const { MONGO_ID, MONGO_PASSWORD, SERVER_IP, NODE_ENV } = process.env;
const MONGO_URL = `mongodb://${MONGO_ID}:${MONGO_PASSWORD}@localhost:27017/admin`;

module.exports = () => {
    const connect = () => {

        if (NODE_ENV !== 'production') {
            mongoose.set('debug', true);
        }
        mongoose.connect(MONGO_URL, {
            dbName: 'SYDER',
        }, (error) => {
            if (error) {
                console.log('데이터베이스 연결 에러.', error);
            } else {
                console.log('데이터베이스 연결 성공');
            }
        });
    };
    connect();

    // 몽구스 커넥션에 이벤트 리스너 적용.
    mongoose.connection.on('error', (error) => {
        console.error('몽고디비 연결 에러', error);
    });
    mongoose.connection.on('disconnected', () => {
        console.error('몽고 디비 연결이 끊어졌습니다. 연결을 재시도합니다.');
        connect();
    });

    require('./car_status');
};