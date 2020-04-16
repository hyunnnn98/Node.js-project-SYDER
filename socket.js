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
        const car   = '';

        console.log(`New Client Connect!!`, ip, socket.id);
        console.log(`* NOW USER: ${numberOfUser} people`);

        // from HardWare Connect
        socket.on('connectCar', (connectCar) => {
            car = connectCar;
            cars.push(connectCar);
            console.log(`* NOW CAR: ${cars}`);
            console.log('==========================')
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
        socket.on('say', async (messageData) => {
            console.log("From Client :", messageData);
            io.emit('answer', "response Data!!");

            const data = {
                message: messageData,
            };

            await axios
            .post("http://49.143.16.46/api/test", data)
            .then(res => {
                console.log(res);
            })
            .catch(error => {
                console.log(error);
            })
        });

        // to Client Object
        socket.on('test', () => {
            const data = {
                lat: "39.89636335",
                lng: "128.62208554408"
            };

            io.emit("location", JSON.stringify(data));
            console.log('(location data) send to Client!!');
        });


    });
}