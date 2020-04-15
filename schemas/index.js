const mongoose = require('mongoose');

const { MONGO_ID, MONGO_PASSWORD, SERVER_IP, MODE_ENV } = process.env;
const MONGO_URL = `mongodb://${MONGO_ID}:${MONGO_PASSWORD}@${SERVER_IP}:27017/socket_service`;

module.exports = () => {
    const connect = () => {
        if (NODE_ENV !== 'production') {
            mongoose.set('debug', true);
        }
        mongoose.connect(MONGO_URL, {
            dbName: 'syder2020',
        }, (error) => {
            if (error) {
                console.log('데이터베이스 연결 에러.', error);
            } else {
                console.log('데이터베이스 연결 성공');
            }
        });
    };
    connect();

    mongoose.connection.on('error', (error) => {
        console.error('몽고디비 연결 에러', error);
    });
    mongoose.connection.on('disconnected', () => {
        console.error('몽고 디비 연결이 끊어졌습니다. 연결을 재시도합니다.');
        connect();
    });

    require('./carts_status');
    require('./carts_location');

}