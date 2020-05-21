const SocketIO  = require('socket.io');
const axios     = require('axios');

// Firebase collection
const firebase_admin = require("firebase-admin");
const serviceAccount = require("./firebase-admin.json");
firebase_admin.initializeApp({
    credential: firebase_admin.credential.cert(serviceAccount),
    databaseURL: "https://syder-a0944.firebaseio.com"
});

function fcm_message (title, body, token) {
    let info = {
        notification: {
            title,
            body,
        },
        data: {
            fileno: '44',
            style: '성공할까요?'
        },
        token
    }

    return info;
}


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

            // [test] FCM message module
            let token = 'crg_SiK-Xwg:APA91bEnLIqPZHwQvmHU2KOHtRwJKrJ3P761mZqDslKjToUYj9ebG6O03W8YDw9xmOsq0xDWrSMNIWXf8Mit6uleArIZhTIBawED5M73Y-CdtFFdc1xDnYWUVYVOj3YZcGqoDDhMvmzy'
            // let token = 'fQBF5H-0Pm8:APA91bFHUz9dP8W6Lnf7pXKHfD3Nu6dt9Qdh3MeM6O9mBAPU0qppy87kPcfa1QOWiVTgcTUeZGciSqAKB1zEj05azmmfLm9Kzs-n01zq84MwSdvFLqKeAn2QkDXCEwwkSBxM8Wpw5o_e'
            let title = "안녕!";
            let body  = "테스트 모드 입니다!";
            firebase_admin.messaging().send(fcm_message( title, body, token )) 
                .then ((res) => {
                    console.log('메시지 전송 성공!', res);
                })
                .catch ((err) => {
                    console.log('메시지 전송 실패!', err);
                })
            // let payload = {
            //     notification: {
            //         title,
            //         body,
            //     }
            // };
            // firebase_admin.messaging().sendToDevice(token, payload)
            //     .then ((res) => {
            //         console.log('메시지 전송 성공!', res);
            //     })
            //     .catch ((err) => {
            //         console.log('메시지 전송 실패!', err);
            //     })

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
        device.on('car_arrivalNotification', (res_info) => {

            // [ EXAMPLE ]
            // res_info = {
            //     status           : 0,
            //     carNumber        : 1,
            //     start_point      : '연서관',
            //     end_point        : '도서관',
            // }

            //TODO 차량 status보고 DB에서 토큰 값 가져와서 FMC으로 유저한태 메세지 보내기.
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

            // TODO 필요한 데이터 정보만 빼기
            const location_data = await StatusInfo.find();

            /* [EXAMPLE]
            location_data = {
                carNumber: 1,
                car_info: {
                    status: 301,
                    lat: 35.896303,
                    lng: 128.620828,
                    battery: 98
                },
                call: {
                    start_point: "청문관",
                    end_point: "본관",
                    time: "10:12",
                },
            }
             */

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
            // 최신화 된 위치값 DB에서 불러온 후 안드로이드로 실시간 전송.
            const location_data = await StatusInfo.find();
            socket.emit('user_updateLocation', location_data);
        });

        // Request for car departure from user ( 유저로 부터 출발 요청 받기 )
        socket.on('user_departureOrder', (locationInfo) => {
            console.log(`Connect to the USER namespace!, Now ${users} users online`);
            // 1. locationInfo 안에 있는 차량 정보 꺼내오기.
            //TODO 출발요청 받은거 DB 최신화

            // locationInfo = {
            //      status           : 301,
            //      carNumber        : 1,
            //      path_id          : 3,
            //      path_way         : reverse
            //      sender_token     : 'FDEFJLKWW@#322323LKWJKJAWWW',
            //      receiver_token   : 'FDEFJLKWW@#322323LKWJKJAWWW',
            // }

            //TODO locationInfo.status 보고 차한테 출발 명령 보낼지 말지 결정해야 함.
            // [if] 만약 출발지에 이미 있을 경우 FCM으로 "차량이 '00장소' 에서 대기중입니다!" 라고 메시지 보내기.

            // [ELSE] path 스키마에서 path값 긁어온다음 차한테 데이터 전송

            // path_Info = {
            //     status : 301,
            //     path   : {
            //         0 : {
            //             path_lat: 35.896303,
            //             path_lng: 128.620828,
            //         },
            //         1: {
            //             path_lat: 35.896303,
            //             path_lng: 128.620828,
            //         },
            //         2: {
            //             path_lat: 35.896303,
            //             path_lng: 128.620828,
            //         },
            //         3: {
            //             path_lat: 35.896303,
            //             path_lng: 128.620828,
            //         },
            //         4: {
            //             path_lat: 35.896303,
            //             path_lng: 128.620828,
            //         },
            //     }
            // }

            // [ELSE] 일때만 차한테 출발 명령 보내는걸로 설정해야 함!
            // CAR룸으로 지정된 carNumber에 출발 명령 전송.
            device.in('CAR' + locationInfo.carNumber).emit('car_departureOrder', path_Info);
        });

        // Request to open the car from the user
        socket.on('user_openRequest', (car_info) => {
            console.log('유저로 부터 차량 개방 요청 받음!');
            // car_info = {
            //     status    : 301,
            //     carNumber : 1,
            // }
            // car 네임스페이스로 차량 개방 요청 전송.
            device.in('CAR' + car_info.carNumber).emit('car_openRequest', car_info);
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