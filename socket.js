const SocketIO = require('socket.io');

module.exports = (server, app) => {
    const io = SocketIO(server);
    // 라우터에서 io 객체를 쓸 수 있게 저장.
    // 접근할땐 req.app.get('io')로 접근이 가능하다.
    
    app.set('io', io);

    let numberOfUser = 0;   // count of User

    io.on('connection', (socket) => {
        numberOfUser++;
        const req = socket.request;
        const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
        console.log(`New Client Connect!!`, ip, socket.id);
        console.log(`* NOW USER: ${numberOfUser} people`)
        console.log('==========================')

        socket.on('disconnect', () => {
            console.log('Client Disconnect', ip, socket.id);
            clearInterval(socket.interval);
            numberOfUser--;
        });

        // from Client Object
        socket.on('say', (messageData) => {
            console.log("From Client :", messageData);
            io.emit('answer', "response Data!!");
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