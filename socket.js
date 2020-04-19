const SocketIO = require('socket.io');
const axios = require('axios');
// mongo collection
let StatusInfo = require('./schemas/car_status');

module.exports = (server, app) => {
    const io = SocketIO(server);
    // 라우터에서 io 객체를 쓸 수 있게 저장.
    // 접근할땐 req.app.get('io')로 접근이 가능하다.
    
    app.set('io', io);
    
    let cars            = [];
    let numberOfUser    = 0;   // count of User
    
    io.on('connection', (socket) => {
        numberOfUser++;
        const req       = socket.request;
        const ip        = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
        const socketID  = socket.id;

        console.log(`New Client Connect!!`, ip, socket.id);
        console.log(`* NOW USER: ${numberOfUser} people`);
        
        // from HardWare Connect
        socket.on('connectCar', (connectCar) => {       
            // 소켓 아이디를 이용해서  ( id, 차량 호수 ) 매칭시키기.
            let data = {
                id: socketID,
                name: connectCar,
                status: "운행대기",
            }
            cars.push(data);
            console.log(`* NOW CAR: ${listOfCar()}`);
            console.log('==========================')
        });

        // Client out of Car connect
        socket.on('carDisconnect', (connectedCar) => {
            // delete connectedCar of index
            io.emit('answer', `${connectedCar} 차량 접속 해제!`);
            for (car in cars) {
                if (cars[car].id == socketID) {
                    console.log("* 선택된 car 번호 : ", car)
                    cars.splice(car, 1);
                }
            };
            console.log(`* CAR Disconnect : ${connectedCar}`);
        })

        // Client out of Server connect
         socket.on('disconnect', () => {
             console.log('* Client Disconnect', ip, socket.id);
            console.log(`* NOW CAR: ${listOfCar()}`);
            console.log('==========================')
            clearInterval(socket.interval);
            numberOfUser--;
        });

        // from Client Object
        socket.on('say', (messageData) => {
            console.log(`From ${whoAmI(socketID)} :`, messageData);
            socket.emit('answer', `${whoAmI(socketID)}  :  OKOKOK!!`);
        });

        // to Client Object
        socket.on('test', () => {
            const data = {
                lat: "39.89636335",
                lng: "128.62208554408"
            };

            // 테스트용 db 저장
            const info = new StatusInfo({
                car_id: whoAmI(socketID),
                car_battery: 80,
                waypoint_start: "정문",
                waypoint_end: "도서관",
                distance: 1.3,
                delivery_time: 5,
                path: [
                    { 
                        lat: 35.123123,
                        lng: 128.62312 
                    },
                    {
                        lat: 35.123144,
                        lng: 128.62312
                    },
                    {
                        lat: 36.123155,
                        lng: 128.62399
                    }
                ] 
            });
            info.save()
                .then((res) => {
                    console.log(res);
                })
                .catch((err) => {
                    console.log("DB 저장 실패!!!!", err);
                });

            socket.emit("location", JSON.stringify(data));
            console.log('(location data) send to Client!!');
        });

        // change Car status
        socket.on('status', (res) => {
            console.log("요청받은 응답 : ", res);
            let carNumber   = res.name;
            let carStatus   = res.status;

            for (car in cars) {
                if (cars[car].name == carNumber) cars[car].status = carStatus;
            }

            socket.emit('statusChange', "운행중");
        })
    });

    function listOfCar() {
        let result = "";
        for (car of cars) {
            result += car.name + " ";
        }
        return result;
    };

    function whoAmI(socketID) {
        let selectedCar;
        for (car of cars) {
            if (car.id == socketID) {
                selectedCar = car.name;
                break;
            }
        }
        return selectedCar;
    };
}