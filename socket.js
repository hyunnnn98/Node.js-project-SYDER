const SocketIO = require('socket.io');
const axios = require('axios');

// mongoDB collection
// let StatusInfo = require('./schemas/car_status');

module.exports = (server, app) => {
    const io = SocketIO(server);

    app.set('io', io);

    // Count of namespace objects
    let cars  = [];
    let users = 0;   

    // Namespace distinction
    const device = io.of('/device');
    const user = io.of('/user');
    const admin = io.of('/admin');

    // Car namespace
    device.on('connection', (socket) => {

        const req = socket.request;
        const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
        const socketID = socket.id;

        // Client out of server unconnect by the network error.
        socket.on('disconnect', () => {
            //TODO [네트워크 연결종료 상황임으로] for문돌려서 해당 socket.id가 누구인지 찾아내야 함.

            for (car in cars) {
                if (cars[car].socketID == socketID) {
                    console.log(`* [네트워크 연결종료] ${whoAmI(socketID)}호차 *`, ip, socket.id);
                    cars.splice(car, 1);
                }
            };

            console.log(`* NOW CAR: ${listOfCar()}`);
            console.log('==========================')
            clearInterval(socket.interval);
        });

        // Client out of server unconnect by the nomal root.
        device.in('room' + data.roomId).on('car_disconnect', () => {
            console.log('* [연결해제] Client Disconnect', ip, socket.id);

            for (car in cars) {
                if (cars[car].socketID == socketID) {
                    console.log(`* [연결해제] ${whoAmI(socketID)}호차 *`, ip, socket.id);
                    cars.splice(car, 1);
                }
            };

            console.log(`* NOW CARS: ${listOfCar()}`);
            console.log('==========================')
            clearInterval(socket.interval);
        });

        // [Join Room] Create a room and give each car an ID.
        // When a client(= car) connects then
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
        socket.on('car_update', (res) => {

            // [ EXAMPLE ]
            // res = {
            //     status           : 0,
            //     carNumber        : 1,
            //     start_point      : '연서관',
            //     end_point        : '도서관',
            //     sender_token     : 'FDEFJLKWW@#322323LKWJKJAWWW',
            //     receiver_token   : 'FDEFJLKWW@#322323LKWJKJAWWW',
            // }
            console.log("Requested response : ", res);

            const locationData = {
                carNumber: res.name,
                carLat: res.lat,
                carLng: res.lng
            };

            //TODO 여기서 위치정보 DB 최신화하기.
            // 최신화 한 위치값 DB에서 불러온 후 관리자, 유저한테 실시간 전송.
            admin.emit('car_updateLocation', locationData);
            user.emit('car_updateLocation', locationData);
        });
    });

    // User namespace
    user.on('connection', (socket) => {
        users++;

        const req = socket.request;
        const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
        const socketID = socket.id;

        console.log(`USER 네임스페이스에 접속`);

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

        //TODO 통합 차량 위치 저장공간 만들기.DB가 필요하다.
        socket.on('admin_locationRequest', () => {
            socket.emit('admin_locationResponse', '여기에 각 차량별 위치값을 넣을 예정임.')
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