# Nodejs-projcet-SYDER

사용기술: AWS EC2, MongoDB, Node, Express, Socket IO, Android

<a href="https://github.com/kokomade98/Node.js-project-SYDER/blob/master/Socket%20API.md">차량 제어 API 문서</a>

### 2020.04.10
```
1. [노드 서버] 테스트 버젼 node 서버 구축 시작.
2. [안드로이드] 테스트 버젼 어플리케이션 구축 시작.
```

### 2020.04.11
```
1. [노드 서버] Socket 통신으로 Server <-> Client 데이터 주고 받기 완료.
2. [노드 서버] Client로 보내는 메세지 JSON 처리.
3. AWS Lightsail에 완성된 서버 배포.
4. [안드로이드] Socket 통신환경 구축 완료. ( 테스트 성공 )
```

### 2020.04.12
```
1. [노드 서버] 리펙토링. ( 소켓통신 구현 부분 따로 분리 )
2. 기존 Lightsail 서비스 이용 종료 ( 프리티어 기한 문제 )
3. AWS EC2 도입 ( 우분투 환경에 노드, 몽고 셋팅 완료 )
4. EC2에 완성된 서버 배포. ( 테스트 성공 )
```

### 2020.04.15
```
1. EC2 몽고DB 권한 설정. ( 외부접속, 포트번호 재정의 )
2. [노드 서버] MongoDB Schema 구상 -> 스키마 구현.
```

### 2020.04.16
```
1. [안드로이드] 통신했던 데이터 SharedPreferences를 이용하여 내부 저장.
2. [안드로이드] 람다식을 통한 코드 리펙토링.
3. [노드 서버] connect => 차량 번호를 통해 해당 접속자 판별.
```

### 2020.04.17
```
1. [노드 서버] 차량 통신간에 전체 메세지 발송건 => 해당 차량에만 발송하게 설정.
2. [노드 서버] Socket서버 접속 시 중복 접속 확인을 위해 (Car) Duplicate Check.
```

### 2020.04.18
```
1. [노드 서버] 노드 -> 라라벨 차량 상태 변경 테스트용 모듈 구현.
2. [안드로이드] 라라벨 상태구현 테스트용 모듈 구현.
3. [노드 서버] mongoDB 컬렉션 설계, Socket통신으로 DB 데이터 (CREATE API) 구현.
```

### 2020.04.19
```
1. [노드 서버] 라라벨 소켓통신 구현 불가로 인해 http통신을 통한 API접속방식으로 우회하도록 변경.

 ( 1 ) 라라벨 (데이터 전달) -> [http 통신] -> 노드 서버
 ( 2 ) 노드 서버 -> [http 통신] -> 라라벨 
 ( 3 ) 노드 서버 -> [소켓 통신] -> 안드로이드, 하드웨어로 데이터 전달.
 ( 4 ) 하드웨어, 안드로이드에서 받은 데이터 -> [http 통신] -> 라라벨

2. [노드 서버] 외부접속 허용을 위한 CORS 설정.
```

### 2020.04.26
```
1. [노드 서버] 테스트용 차량 이동 모듈 구현.
```

### 2020.05.01
```
1. [노드 서버] 유저 / 차량 소켓 네임스페이스 분할.
```

### 2020.05.13
```
1. [노드 서버] 유저 / 차량 / 관리자 네임스페이스 분할.
2. [노드 서버] 차량 네임스페이스 -> ROOM으로 세부 분할하여 관리.

@ [UPDATE]
Client out of server unconnect by the nomal root.
Create a room and give each car an ID.
Change location from test module.

@ [CREATE]
Request for car departure from user.
Request to open the car from the user.
Client out of server unconnect by the nomal root.
```

### 2020.05.14
```
@ [UPDATE]
몽고DB 스키마 수정. (Object형태로 묶음)

@ [CREATE]
CAR -> [Req]Change location => 몽고DB 조회 후 DB값 존재 여부에 따라 INSERT, UPDATE 구분.
Change location to User, Admin.
```

### 2020.05.17
```
@ [UPDATE]

@ [CREATE]
Firebase FCM 도입. firebae_token으로 유저에게 차량 관련 알림 전송.
```

### 2020.05.19
```
@ [UPDATE]
Socket API document 작성.
```

### 2020.05.22
```
@ [UPDATE]
Socket API document 업데이트.
```

### 2020.05.24
```
@ [CREATE]
MongoDB car_path 스키마 생성

@ [UPDATE]
FCM 메시지 유동적인 처리
car_status 상태코드 업데이트.
```

### 2020.05.26
```
@ [CREATE]
Connect to AWS MongoDB
```

### 2020.05.30
```
@ [UPDATE]
FCM 메시지에 Android Activity 포함해서 보내기.
Socket.API 업데이트.
```

### 2020.06.02
```
@ [CREATE]
1. 관리자페이지 http 통신 => car_path 추가 / 삭제 등록.
```
