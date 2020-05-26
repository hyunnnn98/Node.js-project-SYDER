const express   = require('express');
const cors      = require('cors');
const path      = require('path');
const flash     = require('connect-flash');
require('dotenv').config()

const webSocket     = require('./socket');
const indexRouter   = require('./routes');
const mongoConnect  = require('./schemas');

const app = express();
mongoConnect();

// CORS *
app.use(cors())
app.get('/products/:id', function (req, res, next) {
    res.json({ msg: 'This is CORS-enabled for all origins!' })
})

// HTTP WEB CONNECT
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.set('port', process.env.PORT);

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());
app.use(flash());

// ROUTER SETTING
app.use('/', indexRouter);
app.use('/status', indexRouter);

// ERROR HANDLERING
app.use((req, res, next) => {
    const err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// TEST
// const PathInfo = require('./schemas/car_path');
// const update_Info = new PathInfo({
//     'path_id' : 1,
//     'start_point': 2,
//     'end_point': 3,
//     'travel_time': 13,
//     'travel_distance': 12,
//     'path_info': [
//         {
//             'lat': 35.89623422094425,
//             'lng': 128.62013646906556
//         },
//         {
//             'lat': 35.89623422094425,
//             'lng': 128.62013646906556
//         },
//         {
//             'lat': 35.89623422094425,
//             'lng': 128.62013646906556
//         },
//         {
//             'lat': 35.89623422094425,
//             'lng': 128.62013646906556
//         }
//     ],
// });
// update_Info.save()
//     .catch(err => {
//         console.log('DB저장 실패!!', err)
//     });


// SERVER CONNECT
const server = app.listen(app.get('port'), () => {
    console.log('Listening at port number :', app.get('port'));
});

webSocket(server, app);