# Syder 2020 - NODE SERVER

## 차량 접속 API
```
Socket_URL = "http://" + Socket_IP  +":" + Socket_PORT + "/device";

socket.connect();
```

### ● 차량 등록
```
socket.emit("connectCar", carNumber);

(String)carNumber 

Ex) socket.emit("connectCar", "1호차");
```

### ● 차량 위치정보 전송
```
socket.emit("status", data);

(Objext)data 

Ex) socket.emit("connectCar", data);

1) 운행중
data: {
    car_id: "1호차",
    car_battery: 80,
    status: "운행중"
    waypoint_start: "정문",
    waypoint_end: "도서관",
    distance: 1.3,
    delivery_time: 5,
}

2) 운행대기
data: {
    car_id: "1호차",
    car_battery: 80,
    status: "운행대기"
    waypoint_start: "",
    waypoint_end: "",
    distance: 1.3,
    delivery_time: 5,
}
```

### ● 수신자 위치 이동 명령
```
socket.on("delivery_receiver", location);

(Objext)location 

location: {
    start: "청문관"
    end: "본관"
    qrCode: "~~~~"
    path: [
        { 
            lat: 35.123123,
            lng: 128.62312 
        },
        {
            lat: 35.123144,
            lng: 128.62312
        },
        .... 경로 정보
    ],
}

Ex) socket.emit("location", location);
```


#

## 유저 접속 API
```
Socket_URL = "http://" + Socket_IP  +":" + Socket_PORT + "/user";

socket.connect();
```

### ● 차량 위치 데이터 받기
```
socket.on("location", onLocation);

(Objext)onLocation 

onLocation: {
    1호차: {
        lat: "35.123123",
        lng: "128.62312",
        battery: "86",
    },
    2호차: {
        lat: "36.123155",
        lng: "128.62399",
        battery: "50",
    },
    3호차: {
        lat: "36.123155",
        lng: "128.62399",
        battery: "47",
    },
}

Ex) socket.on("location", onLocation);
```

#

## 관리자 접속 API
```
Socket_URL = "http://" + Socket_IP  +":" + Socket_PORT + "/admin";

socket.connect();
```