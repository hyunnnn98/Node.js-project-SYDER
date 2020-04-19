const express   = require('express');
const cors      = require('cors');
const path      = require('path');
const flash     = require('connect-flash');
require('dotenv').config()

const webSocket     = require('./socket');
const indexRouter   = require('./routes');
const mongoConnect  = require('./schemas');

const app = express();
// mongoConnect();      // AWS 몽고DB 연결 (X).

// CORS 모든 도메인 권한 풀기.
// app.all('/*', function (req, res, next) {
//     res.header("Access-Control-Allow-Origin", "*");
//     res.header("Access-Control-Allow-Headers", "X-Requested-With");
//     next();
// });
app.use(cors())
app.get('/products/:id', function (req, res, next) {
    res.json({ msg: 'This is CORS-enabled for all origins!' })
})

// pug로 웹페이지 통신.
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.set('port', process.env.PORT);

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());
app.use(flash());

// 초기 페이지 설정
app.use('/', indexRouter);
app.use('/status', indexRouter);
app.use((req, res, next) => {
    const err = new Error('Not Found');
    err.status = 404;
    next(err);
});

const server = app.listen(app.get('port'), () => {
    console.log('Listening at port number :', app.get('port'));
});
//return socket.io server.

webSocket(server, app);