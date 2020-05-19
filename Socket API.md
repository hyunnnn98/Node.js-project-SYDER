# Syder 2020 - NODE SERVER


## [하드웨어] Car

#### ● 소켓서버 접속
```javascript
Socket_URL = "http://" + Socket_IP  +":" + Socket_PORT + "/device";

socket.connect();
```
#### ● 소켓서버 접속 해제
```javascript
socket.disconnect();
```

#### ● 고유번호 접속
```javascript
socket.emit("JOIN:CAR", carNumber);

EX)
carNumber = {
    carNumber: 1,
    status: '운행대기'
}
```
#### ● 고유번호 접속 해제
```javascript
socket.emit("car_disconnect");
```

#### ● 상태변화 알림
```javascript
socket.emit("car_arrivalNotification", status_info); 

Ex) socket.emit("car_arrivalNotification", status_info);

status_info = {
    status           : 301,
    carNumber        : 1,
    start_point      : '연서관',
    end_point        : '도서관',
}
```

#### ● 위치변화 전송
```javascript
socket.emit("car_update", location_info);

Ex) socket.emit("car_update", location_info);

location_info = {
    status      : 301,
    carNumber   : 1,
    car_lat     : 35.896303,
    car_lng     : 128.620828,
    car_battery : 98,
}
```
#### ● 개방 요청 받기
```javascript
socket.on("car_update", token_info);

Ex) socket.on("car_update", token_info);

token_info = {
    status    : 301,
    carNumber : 1,
    sender_token     : 'FDEFJLKWW@#322323LKWJKJAWWW',
    receiver_token   : 'FDEFJLKWW@#322323LKWJKJAWWW',
}
```

#
## [안드로이드] User

#### ● 소켓서버 접속
```javascript
Socket_URL = "http://" + Socket_IP  +":" + Socket_PORT + "/user";

socket.connect();
```

#### ● 소켓서버 접속 해제
```javascript
socket.disconnect();
```

#### ● 차량 위치 조회
```javascript
socket.emit("locationRequest");

Ex) socket.emit("locationRequest", cars_info);

car_location = {
    1 : {
        car_info : {
            status  : 301,
            lat     : 35.896303,
            lng     : 128.620828,
            battery : 98
        },
        call : {
            start_point : "본관",
            end_point : "도서관",
            time : "3:12",
        },
    },
    2 : {
        car_info : {
            status  : 301,
            lat     : 35.896303,
            lng     : 128.620828,
            battery : 98
        },
        call : {
            start_point : "청문관",
            end_point : "본관",
            time : "10:12",
        },
    },
    3 : {
        car_info : {
            status  : 301,
            lat     : 35.896303,
            lng     : 128.620828,
            battery : 98
        },
        call : {
            start_point : "청문관",
            end_point : "본관",
            time : "10:12",
        },
    },

}
```

#### ● 차량 위치변화 알림
```javascript
socket.on("car_updateLocation", car_location);

Ex) socket.on("car_updateLocation", car_location);

car_location = {
    carNumber   : 1,
    car_info : {
        status  : 301,
        lat     : 35.896303,
        lng     : 128.620828,
        battery : 98
    },
    call : {
        start_point : "청문관",
        end_point : "본관",
        time : "10:12",
    },
}
```

#### ● 차량 개방 요청
```javascript
socket.emit("user_openRequest", token_info);

Ex) socket.emit("car_updateLocation", token_info);

token_info = {
    status    : 301,
    carNumber : 1,
    sender_token     : 'FDEFJLKWW@#322323LKWJKJAWWW',
    receiver_token   : 'FDEFJLKWW@#322323LKWJKJAWWW',
}
```

#
## [웹] Admin

#### ● 소켓서버 접속
```javascript
Socket_URL = "http://" + Socket_IP  +":" + Socket_PORT + "/admin";

socket.connect();
```
#### ● 소켓서버 접속 해제
```javascript
socket.disconnect();
```

#### ● 차량 위치변화 알림
```javascript
socket.on("car_updateLocation", car_location);

Ex) socket.on("car_updateLocation", car_location);

car_location = {
    carNumber   : 1,
    car_info : {
        status  : 301,
        lat     : 35.896303,
        lng     : 128.620828,
        battery : 98
    },
    call : {
        start_point : "청문관",
        end_point : "본관",
        time : "10:12",
    },
}
```
