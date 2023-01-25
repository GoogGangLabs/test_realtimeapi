# 프로젝트 설계 문서

데이터베이스, 프로젝트 구조 등 설계 관련 문서입니다.

<br>

## Server Architecture

![Untitled](https://user-images.githubusercontent.com/74334399/214564037-ebbc0eea-c389-479b-8e2e-d5f88cd26579.png)

<br>

EC2 내의 모든 서비스는 Container 위에 구동됩니다.<br>
모든 요청을 한곳에서 관리하기 위해 Nginx를 이용하였습니다.<br>
기능 별 분리된 구조를 택하여 각 서비스 간 부하를 줄이는데 노력하였습니다.<br>

<br>

## Streaming Process

```mermaid
sequenceDiagram
participant c as Client
participant i as Input Server
participant o as Output Server
participant r as Redis Pub/Sub
participant d as Deep Learning Server

c->>c: 영상 Frame 추출 및 Base64 인코딩
c->>i: Frame 데이터 송신
i->>r: Client 라벨링 및 Frame 데이터 전송
d->>r: Redis 폴링 및 Frame 데이터 수신
d->>d: Frame 데이터 Holistic 처리
d->>r: 딥러닝 결과 Json 전송
o->>r: Redis 폴링 및 딥러닝 결과 수신
o->>c: Client 특정 후 딥러닝 결과 송신
c->>c: Mediapipe 라이브러리를 이용해 딥러닝 결과 송출
```

<br>

분산 환경에서 서비스 간 통신을 위해 Redis Pub/Sub 어플리케이션을 이용하였습니다.<br>
실시간 영상 서비스인만큼, 데이터 유실에 부담을 갖지 않아도 된다 생각하여 Kafka보다 가벼운 Redis를 이용하였습니다.<br>
서버에서 딥러닝 처리에 대한 오버헤드가 커질것을 예상하여 각 서비스 별 비동기를 이용한 멀티스레드를 적절히 이용하였습니다.<br>

<br>

## Socket Connection

```mermaid
sequenceDiagram
participant c as Client
participant i as Input Server
participant o as Output Server
participant r as Redis

c->>+i: WS handshake 요청하며 사이트 접근 비밀번호 전달
i->>i: 정상접근 판단 후, uuid를 sessionId로 사용자 라벨링
i->>r: sessionId를 Key로, value를 1로 설정하여 저장
i-->>-c: sessionId 응답
c->>+o: WS handshake 요청하며 발급받은 sessionId 전달
o->>r: 해당 sessionId 조회
r-->>o: 해당 sessionId의 value 전달
alt value가 1이 아니면
o-->>c: WS 연결 오류 응답
o->>i: 해당 sessionId 연결 해제 요청
i->>c: WS 연결 종료
end
o-->>-c: WS 연결 완료 응답
```

<br>

분산 환경에서 원하는 결과를 도출해내기 위해 Client를 특정할 수 있는 라벨링을 시도했습니다.<br>
uuid를 이용해 Client에게 고유번호를 부여하였고, 여러 사용자가 접속해도 처리가 가능한 환경을 구성하였습니다.<br>
비정상적인 접근을 방지하고자 Redis를 이용하여 Session 정보를 저장하였고, 이를 통해 Input/Output Server 간 인증에 관한 Sync를 맞출 수 있었습니다.<br>

<br>
