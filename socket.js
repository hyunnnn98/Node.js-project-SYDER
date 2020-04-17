const SocketIO = require('socket.io');
const axios = require('axios');

module.exports = (server, app) => {
    const io = SocketIO(server);
    // 라우터에서 io 객체를 쓸 수 있게 저장.
    // 접근할땐 req.app.get('io')로 접근이 가능하다.
    
    app.set('io', io);
    
    const cars  = [];
    let numberOfUser = 0;   // count of User

    io.on('connection', (socket) => {
        numberOfUser++;
        const req   = socket.request;
        const ip    = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
        let   car   = '';

        console.log(`New Client Connect!!`, ip, socket.id);
        console.log(`* NOW USER: ${numberOfUser} people`);

        // from HardWare Connect
        socket.on('connectCar', (connectCar) => {
            let check = true;
            car = connectCar;

            // if - same name car come to Server => quit out of Server.
            for (car of cars) {
                if (car == connectCar) {
                    socket.emit('answer', `This car is already in the Server!!`);
                    check = false;
                    break;
                }
            }

            if (check === true) {
                cars.push(connectCar);
                console.log(`* NOW CAR: ${cars}`);
                console.log('==========================')
            }
        });

         socket.on('disconnect', () => {
            // delete connectedCar of index
            cars.splice(cars.indexOf(car), 1);
            console.log('Client Disconnect', ip, socket.id);
            console.log(`* NOW CAR: ${cars}`);
            clearInterval(socket.interval);
            numberOfUser--;
        });

        // from Client Object
        socket.on('say', (messageData) => {
            console.log(`From ${car} :`, messageData);
            socket.emit('answer', `${car} : response Data!!`);

            const data = {
                message: messageData,
            };

            // await axios
            // .post("http://49.143.16.46/api/test", data)
            // .then(res => {
            //     console.log(res);
            // })
            // .catch(error => {
            //     console.log(error);
            // })
        });

        // to Client Object
        socket.on('test', () => {
            const data = {
                lat: "39.89636335",
                lng: "128.62208554408"
            };

            socket.emit("location", JSON.stringify(data));
            console.log('(location data) send to Client!!');
        });


    });
}