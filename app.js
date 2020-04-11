const express = require('express');
const socketio = require('socket.io');
const path = require('path');
const flash = require('connect-flash');
require('dotenv').config()

const indexRouter = require('./routes');

const app = express();

// CORS 모든 도메인 권한 풀기.
app.all('/*', function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "X-Requested-With");
    next();
});

// pug로 웹페이지 통신.
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');
app.set('port', process.env.PORT || 80);

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());

app.use(flash());

// 초기 페이지 설정
app.use('/', indexRouter);

const server = app.listen(80, () => {
    console.log('Listening at port number 80') 
})
//return socket.io server.

var io = socketio.listen(server)
// 이 과정을 통해 express 서버를 socket io 서버로 업그레이드 한다.

io.on('connection', (socket) => {

    const req = socket.request;
    const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    console.log('New Client Connect!', ip, socket.id, req.ip);

    socket.on('disconnect', () => {
        console.log('Client Disconnect', ip, socket.id);
        clearInterval(socket.interval);
    });

    socket.on('say', (data) => {
        console.log("From Client :", data);
        socket.emit('answer', "response Data!!");
    });

    socket.on('test', () => {
        const data = {
            lat: "39.89636335",
            lng: "128.62208554408"
        };

        socket.emit("location", JSON.stringify(data));
        console.log('(location data) send to Client!!');
    });
})