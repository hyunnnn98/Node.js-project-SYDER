const SocketIO  = require('socket.io');
const axios     = require('axios');

// Firebase collection
const firebase_admin = require("firebase-admin");
const serviceAccount = require("./firebase-admin.json");
firebase_admin.initializeApp({
    credential: firebase_admin.credential.cert(serviceAccount),
    databaseURL: "https://syder-f6710.firebaseio.com"
});

function fcm_message (title, body, token) {
    let info = {
        notification: {
            title,
            body,
            'clickAction': 'CarLocationActivity',
        },
        data: {
        },
        token
    }
    return info;
}


// mongoDB collection
const StatusInfo = require('./schemas/car_status');
const PathInfo   = require('./schemas/car_path');

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
            // socket.join('CAR' + data.carNumber);
            console.log(`* 새로운 차량 접속! *`, ip, socket.id);

            // Return array of created objects
            cars.push(data);

            console.log(`* NOW CAR: ${listOfCar()}`);
            console.log('==========================')
        });

        // Client out of server unconnect by the network error.
        socket.on('disconnect', () => {
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

        // Get notifications from all cars ( 모든 차로부터 도착 알림 받기 )
        socket.on('car_arrivalNotification', async (res_info) => {
            console.log('차량으로 부터 알림을 받았습니다!')

            // [ EXAMPLE ]
            // res_info = {
            //     status           : 0,
            //     carNumber        : 1,
            // }
            
            /*
               - The cart is stopping  | 100 : Assignment completed / 101 : Receiver consent / 102 : Receiver reject
               - The cart is waiting   | 200 : Wating at starting point / 201 : Waiting at arrival point
               - The cart is moving    | 300 : Moving to arrival point / 301 : Moving to starting point
               - Order status          | 400 : Order end / 401 : Order cancel
               - Etc                   | 900 : Waiting for cart assignment
            */
            const car_info      = await StatusInfo.findOne({ carNumber: res_info.carNumber });
            const start_point   = car_info.call.start_point;
            const end_point     = car_info.call.end_point;
            let token           = '';
            let temp_point      = '';
            let temp_status     = '';
            let title           = 'SYDER';
            let body            = '';
            
            // 차량 status보고 DB에서 토큰 값 가져와서 FMC으로 유저한태 메세지 보내기.
            switch (res_info.status) {
                case 301:
                case 200:
                    // (1) 발신자에게 [차량 출발] 출발지 알림 전송.
                    // MSG = carNumber호차 res_info.starting_point로 출발했습니다!
                    // res_info.receiver_token => MSG
                    // (2) 발신자에게 [차량 도착] 출발지 알림 전송.
                    // MSG = res_info.starting_point에 도착했습니다!
                    // res_info.receiver_token => MSG
                    temp_point  = start_point;
                    token = car_info.token.sender;
                    
                    if (res_info.status == 301 ) {
                        temp_status = '출발';
                        body = `${res_info.carNumber}호차 ${temp_point}로 ${temp_status}했습니다!`;
                    } else {
                        temp_status = '도착';
                        body = `${res_info.carNumber}호차 ${temp_point}로 ${temp_status}했습니다!`;
                    }
                    break;
                case 300:
                case 201:
                    // (3) 수신자에게 [차량 출발] 도착지 알림 전송
                    // MSG = carNumber호차 res_info.end_point로 출발했습니다!
                    // res_info.sender_token => MSG
                    // (4) 수신자에게 [차량 도착] 도착지 알림 전송
                    // MSG = carNumber호차 res_info.end_point에 도착했습니다!
                    // res_info.sender_token => MSG
                    temp_point = end_point;
                    token = car_info.token.receiver;

                    if (res_info.status == 300) {
                        temp_status = '출발';
                        body = `${res_info.carNumber}호차 ${temp_point}로 ${temp_status}했습니다!`;
                    } else {
                        temp_status = '도착';
                        body = `${res_info.carNumber}호차 ${temp_point}로 ${temp_status}했습니다!`;
                    }                    
                    break;
                case 400:
                    // (마지막) 발신자, 수신자에게 [운행 완료] 알림 전송.
                    // res_info.sender_token    => 운행이 종료되었습니다!
                    // res_info.receiver_token  => 운행이 종료되었습니다!
                    body = `운행이 종료되었습니다!`;
                    token = [car_info.token.sender, car_info.token.receiver]
                    break;
                case 900:
                    // TODO 관리자한테 소켓 메시지, 라라벨로 DB업데이트 요청 전송.
                    break;
            }

            firebase_admin.messaging().send(fcm_message(title, body, token))
                .then((res) => {
                    console.log('메시지 전송 성공!', res);
                })
                .catch((err) => {
                    console.log('메시지 전송 실패!', err);
                })

            //TODO 운행 완료시 라라벨로 운행 완료 HTTP 통신 메시지 보내야 함.
        })

        // Change location from test module (= 테스트 모듈로 부터 차량 위치변경 정보 전송.)
        socket.on('car_update', async (res) => {
            console.log('차량으로 부터 위치 변경 알림을 받았습니다!')
            // [ EXAMPLE ] 
            // res = {
            //     status      : 301,
            //     carNumber   : 1,
            //     car_lat     : 35.896303,
            //     car_lng     : 128.620828,
            //     car_battery : 98,
            // }

            const status    = res.status;
            const carNumber = res.carNumber;
            const lat       = res.car_lat;
            const lng       = res.car_lng;
            const battery   = res.car_battery;

            const searchCar = await StatusInfo.findOne({ carNumber });
            console.log('searchCar: ', searchCar)

            // [IF] DB 데이터셋이 유지중일 때 => 테이터 업데이트
            if (searchCar) {
                await StatusInfo.update({ carNumber }, { $set: { 
                    status, 
                    lat, 
                    lng, 
                    battery 
                }});
            } else {
                // [ELSE] DB 데이터셋이 없을 때 object 생성 후 데이터 저장
                const update_Info = new StatusInfo({
                    carNumber,
                    status,
                    lat,
                    lng,
                    battery,
                });
                update_Info.save()
                .catch(err => {
                    console.log('DB저장 실패!!', err)
                });
            }

            // TODO 필요한 데이터 정보만 빼기
            const location_data = await StatusInfo.find();

            /* [EXAMPLE]
            location_data = {
                carNumber   : 1,
                status      : 301,
                lat         : 35.896303,
                lng         : 128.620828,
                battery     : 98,
                call: {
                    start_point: "청문관",
                    end_point: "본관",
                    time: "10:12",
                },
            }
             */

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

        // TODO locationre 이름 확인하기
        // TODO reverse 값 불린으로 바꾸기

        // 공용 locationRequest
        socket.on('locationRequest', async () => {
            // 최신화 된 위치값 DB에서 불러온 후 안드로이드로 실시간 전송.
            const location_data = await StatusInfo.find();
            socket.emit('user_updateLocation', location_data);
        });

        // Request for car departure from user ( 유저로 부터 출발 요청 받기 )
        socket.on('user_departureOrder', async (locationInfo) => {
            console.log(`Connect to the USER namespace!, Now ${users} users online`);
            // 1. locationInfo 안에 있는 차량 정보 꺼내오기.
            // locationInfo = {
            //      status           : 200,
            //      carNumber        : 1,
            //      path_id          : 3,
            //      path_way         : 'reverse',
            //      start_point      : "본관"
            //      end_point        : "연서관"
            //      sender_token     : 'FDEFJLKWW@#322323LKWJKJAWWW',
            //      receiver_token   : 'FDEFJLKWW@#322323LKWJKJAWWW',
            // }

            const carNumber = locationInfo.carNumber;

            // 출발요청 받은거 DB 최신화
            await StatusInfo.update({ carNumber }, {
                $set: {
                    'status'            : locationInfo.status,
                    'path_id'           : locationInfo.path_id,
                    'call.start_point'  : locationInfo.start_point,
                    'call.end_point'    : locationInfo.end_point,
                    'token.sender'      : locationInfo.sender_token,
                    'token.receiver'    : locationInfo.receiver_token,
                }
            });
            console.log('출발요청 받은 데이터, DB 최신화 완료!')
            
            // locationInfo.status 보고 차한테 출발 명령 보낼지 말지 결정해야 함.
            // [if] 만약 출발지에 이미 있을 경우 FCM으로 "차량이 '00장소' 에서 대기중입니다!" 라고 메시지 보내기.
            let path_data = await PathInfo.findOne({ path_id: locationInfo.path_id });
            if ( locationInfo.status == 200 ) {
                let title = `차량이 ${locationInfo.start_point}장소에서 대기중입니다!`;
                let body  = '물건을 실어주세요!'
                
                firebase_admin.messaging().send(fcm_message(title, body, locationInfo.sender_token))
                .then((res) => {
                    console.log('메시지 전송 성공!', res);
                })
                .catch((err) => {
                    console.log('메시지 전송 실패!', err);
                })
            } else {
                // [ELSE] path 스키마에서 path값 긁어온다음 차한테 데이터 전송

                // path_way 보고 역방향 / 정방향에 따라 path 순서 바꿔서 보내주기!
                
                if (locationInfo.path_way == 'reverse') path_data = path_info.reverse();
                /*
                    path_Info = [
                                    {
                                        lat: 35.896303,
                                        lng: 128.620828,
                                    },
                                    {
                                        lat: 35.896303,
                                        lng: 128.620828,
                                    },
                                    {
                                        lat: 35.896303,
                                        lng: 128.620828,
                                    },
                                    {
                                        lat: 35.896303,
                                        lng: 128.620828,
                                    },
                                    {
                                        lat: 35.896303,
                                        lng: 128.620828,
                                    },
                                ];
                */ 
                // CAR룸으로 지정된 carNumber에 출발 명령 전송.
                device.to(findCar(carNumber)).emit('car_departureOrder', path_data);
                console.log(`유저로 부터 받은 출발명령 => ${carNumber}호차로 전송 완료!`)
            }
        });

        // Request to open the car from the user
        socket.on('user_openRequest', (carNumber) => {
            console.log('유저로 부터 차량 개방 요청 받음!');
            // carNumber : 1,
            const data = {
                message: '유저로부터 개방 요청을 받았습니다.',
            };
            // car 네임스페이스로 차량 개방 요청 전송.
            device.to(findCar(carNumber)).emit('car_openRequest', data);
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
        let selectedCar;
        for (car of cars) {
            if (car.socketID == socketID) {
                selectedCar = car.carNumber;
                break;
            }
        }
        return selectedCar;
    };

    function findCar(carNumber) {
        let selectedCar;
        for (car of cars) {
            if (car.carNumber == carNumber) {
                selectedCar = car.socketID;
                break;
            }
        }
        return selectedCar;
    };
}