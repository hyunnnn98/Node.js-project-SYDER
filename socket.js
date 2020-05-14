const SocketIO  = require('socket.io');
const axios     = require('axios');

// mongoDB collection
const StatusInfo = require('./schemas/car_status');

module.exports = (server, app) => {
    const io = SocketIO(server);

    app.set('io', io);

    // Count of namespace objects
    let cars  = [];
    let users = 0;   

    // Namespace distinction
    const device  = io.of('/device');
    const user    = io.of('/user');
    const admin   = io.of('/admin');

    // Car namespace
    device.on('connection', (socket) => {

        const req       = socket.request;
        const ip        = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
        const socketID  = socket.id;

        // [Join Room] Create a room and give each car an ID.
        // When a client(= car) connects
        // => Connect with => socket.emit('JOIN:CAR', { carNumber: carNumber });.
        socket.on('JOIN:CAR', (data) => {

            // [ EXAMPLE ]
            // data = {
            //     carNumber: 1,
            //     status: "운행대기",
            // }
            data.socketID = socketID;

            // Register the new car with a socket number.
            socket.join('CAR' + data.carNumber);
            console.log(`* 새로운 차량 접속! *`, ip, socket.id);

            // Return array of created objects
            cars.push(data);

            console.log(`* NOW CAR: ${listOfCar()}`);
            console.log('==========================')
        });

        // Client out of server unconnect by the network error.
        socket.on('disconnect', () => {
            //TODO [네트워크 연결종료 상황임으로] for문돌려서 해당 socket.id가 누구인지 찾아내야 함.
            let disconnectError = false;

            for (car in cars) {
                if (cars[car].socketID == socketID) {
                    console.log(`* [네트워크 연결종료] ${whoAmI(socketID)}호차 *`, ip, socket.id);
                    cars.splice(car, 1);
                }
            };

            // console.log(`* NOW CARS: ${listOfCar()}`);
            // console.log('==========================')
            clearInterval(socket.interval);
        });

        // Client out of server unconnect by the nomal root.
        socket.on('car_disconnect', () => {
            console.log('* [연결해제] Client Disconnect', ip, socket.id);

            for (car in cars) {
                if (cars[car].socketID == socketID) {
                    console.log(`* [연결해제] ${whoAmI(socketID)}호차 *`, ip, socket.id);
                    console.log('~~~~~~~~~~~~~~~~~~~~~~~~~~')
                    cars.splice(car, 1);
                }
            };

            console.log(`* NOW CARS: ${listOfCar()}`);
            console.log('==========================')
            socket.leave('CAR');
        });

        // Get notifications from all cars
        device.on('car_arrivalNotification', (res_info) => {

            // [ EXAMPLE ]
            // res_info = {
            //     status           : 0,
            //     carNumber        : 1,
            //     start_point      : '연서관',
            //     end_point        : '도서관',
            //     sender_token     : 'FDEFJLKWW@#322323LKWJKJAWWW',
            //     receiver_token   : 'FDEFJLKWW@#322323LKWJKJAWWW',
            // }

            //TODO FMC 연동해서 유저한태 메세지 보내기.
            switch (res_info.status) {
                case 301:
                    // 발신자에게 [차량 도착] 알림 전송
                    // MSG = carNumber호차 res_info.starting_point에 도착했습니다!
                    // res_info.sender_token => MSG
                    break;
                case 200:
                    // 수신자에게 [차량 출발] 알림 전송.
                    // MSG = carNumber호차 res_info.starting_point에 도착했습니다!
                    // res_info.receiver_token => MSG
                    break;
                case 201:
                    // 수신자에게 [차량 도착] 알림 전송.
                    // MSG =  res_info.end_point 도착했습니다!
                    // res_info.receiver_token => MSG
                    break;
                case 400:
                    // 수신자, 발신자에게 [운행 완료] 알림 전송.
                    // res_info.sender_token    => 운행이 종료되었습니다!
                    // res_info.receiver_token  => 운행이 종료되었습니다!
                    break;
            }
        })

        // Change location from test module
        socket.on('car_update', async (res) => {

            // [ EXAMPLE ]
            // res = {
            //     status      : 301,
            //     carNumber   : 1,
            //     car_lat     : 35.896303,
            //     car_lng     : 128.620828,
            //     car_battery : 98,
            // }
            console.log("Requested response : ", res);
            const status    = res.status;
            const carNumber = res.carNumber;
            const lat       = res.car_lat;
            const lng       = res.car_lng;
            const battery   = res.car_battery;

            const searchCar = await StatusInfo.findOne({ carNumber });

            // [IF] DB 데이터셋이 유지중일 때
            if (searchCar) {
                await StatusInfo.update({ carNumber }, { $set: { 
                    'car_info.status'   : status, 
                    'car_info.lat'      : lat, 
                    'car_info.lng'      : lng, 
                    'car_info.battery'  : battery 
                }});
            } else {
                // [ELSE] DB 데이터셋이 없을 때 object 생성
                const update_Info = new StatusInfo({
                    carNumber,
                    'car_info.status'   : status,
                    'car_info.lat'      : lat,
                    'car_info.lng'      : lng,
                    'car_info.battery'  : battery,
                });
                update_Info.save()
                .catch(err => {
                    console.log('DB저장 실패!!', err)
                });
            }
            const location_data = await StatusInfo.find();

            //TODO 여기서 위치정보 DB 최신화하기.
            // 최신화 한 위치값 DB에서 불러온 후 관리자, 모든 유저한테 실시간 전송.
            admin.emit('car_updateLocation', location_data);
            user.emit('car_updateLocation', location_data);
        });
    });

    // User namespace
    user.on('connection', (socket) => {
        users++;

        const req       = socket.request;
        const ip        = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
        const socketID  = socket.id;

        console.log(`USER 네임스페이스에 접속`);

        // 공용 locationRequest
        socket.on('locationRequest', async () => {
            // 최신화 된 위치값 DB에서 불러온 후 관리자 페이지로 실시간 전송.
            const location_data = await StatusInfo.find();
            socket.emit('user_updateLocation', location_data);
        });

        // Request for car departure from user
        socket.on('user_departureOrder', (locationInfo) => {
            console.log(`Connect to the USER namespace!, Now ${users} users online`);
            // 1. locationInfo 안에 있는 차량 정보 꺼내오기.

            // locationInfo = {
            //     status           : 301,
            //     carNumber        : 1,
            //     start_point      : '연서관',
            //     end_point        : '도서관',
            //     sender_token     : 'FDEFJLKWW@#322323LKWJKJAWWW',
            //     receiver_token   : 'FDEFJLKWW@#322323LKWJKJAWWW',
            // }

            // CAR룸으로 지정된 carNumber에 출발 명령 전송.
            device.in('CAR' + locationInfo.carNumber).emit('car_departureOrder', locationInfo);
        });

        // Request to open the car from the user
        socket.on('user_openRequest', (locationInfo) => {
            console.log('유저로 부터 차량 개방 요청 받음!');
            // locationInfo = {
            //     status    : 301,
            //     carNumber : 1,
            //     sender_token     : 'FDEFJLKWW@#322323LKWJKJAWWW',
            //     receiver_token   : 'FDEFJLKWW@#322323LKWJKJAWWW',
            // }
            // car 네임스페이스로 차량 개방 요청 전송.
            device.in('CAR' + locationInfo.carNumber).emit('car_openRequest', locationInfo);
        });

        socket.on('disconnect', () => {
            --users;
            console.log('USER 네임스페이스 접속 해제');
        });
    });

    // Admin namespace
    admin.on('connection', (socket) => {
        console.log('관리자 네임스페이스에 접속');

        // 공용 locationRequest
        admin.on('locationRequest', async () => {

            // 최신화 된 위치값 DB에서 불러온 후 관리자 페이지로 실시간 전송.
            const location_data = await StatusInfo.find();
            socket.emit('admin_updateLocation', location_data);
        });

        socket.on('disconnect', () => {
            console.log('관리자가 퇴장했습니다.');
        });
    });



    function listOfCar() {
        let result = "";
        for (car of cars) {
            result += car.carNumber + "호차 ";
        }
        return result;
    };

    function whoAmI(socketID) {
        let carNumber;
        for (car of cars) {
            if (car.socketID == socketID) {
                selectedCar = car.carNumber;
                break;
            }
        }
        return selectedCar;
    };
}