const express = require('express');
const path = require('path');
const socketio = require('socket.io');
const flash = require('connect-flash');
require('dotenv').config()

// const webSocket = require('./socket');
const indexRouter = require('./routes');

const app = express(); // 이번 예제에서는 express를 사용합니다.

app.all('/*', function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "X-Requested-With");
    next();
});

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');
app.set('port', process.env.PORT || 3333);

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());

app.use(flash());

app.use('/', indexRouter);

const server = app.listen(3333, () => {
    console.log('Listening at port number 3333') //포트는 원하시는 번호로..
})
//return socket.io server.
var io = socketio.listen(server)
// 이 과정을 통해 우리의 express 서버를 socket io 서버로 업그레이드를 시켜줍니다.

//이 배열은 누가 chatroom에 있는지를 보여줍니다.
var whoIsOn = [];

//이 서버에서는 어떤 클라이언트가 connection event를 발생시키는 것인지 듣고 있습니다.
// callback 으로 넘겨지는 socket에는 현재 클라이언트와 연결되어있는 socket 관련 정보들이 다 들어있습니다.
io.on('connection', (socket) => {

    const req = socket.request;
    const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    console.log('새로운 클라이언트 접속!', ip, socket.id, req.ip);

    socket.on('disconnect', () => {
        console.log('클라이언트 접속 해제', ip, socket.id);
        clearInterval(socket.interval);
    });

    socket.on('say', (data) => {
        console.log("클라이언트로 부터 받은 메세지 :", data);
        socket.emit('answer', "메세지 잘 받았어.")
    });

    socket.on('test', () => {
        console.log('클라이언트로부터 신호받음!');
    })

    // var nickname = ``

    // //일단 socket.on('login') 이라는 것은 클라이언트가 login 이라는 이벤트를 발생시키면
    // //어떤 콜백 함수를 작동시킬 것인지 설정하는 것입니다.
    // socket.on('login', function (data) {
    //     console.log(`${data} 사용자 접속! ---------------------`)
    //     whoIsOn.push(data) //
    //     nickname = data

    //     // 아래와 같이 하면 그냥 String 으로 넘어가므로 쉽게 파싱을 할 수 있습니다.
    //     // 그냥 넘기면 JSONArray로 넘어가서 복잡해집니다.
    //     var whoIsOnJson = `${whoIsOn}`
    //     console.log(whoIsOnJson)

    //     //io.emit 과 socket.emit과 다른 점은 io는 서버에 연결된 모든 소켓에 보내는 것이고
    //     // socket.emit은 현재 그 소켓에만 보내는 것입니다.       
    //     io.emit('newUser', whoIsOnJson)
    // })

    // socket.on('say', function (data) {
    //     console.log(`${nickname} : ${data}`)
    //     socket.emit('myMsg', data)
    //     socket.broadcast.emit('newMsg', data) 
    //     // socket.broadcast.emit은 현재 소켓이외의 서버에 연결된 모든 소켓에 보내는 것.
    // })

    // socket.on('disconnect', function () {
    //     console.log(`${nickname} 사용자 로그아웃 ------------------------  `)
    // })

    // socket.on('logout', function () {
    //     //Delete user in the whoIsOn Arryay
    //     whoIsOn.splice(whoIsOn.indexOf(nickname), 1);
    //     var data = {
    //         whoIsOn: whoIsOn,
    //         disconnected: nickname
    //     }
    //     socket.emit('logout', data)
    // })

})