# MediaPipe를 이용한 실시간 영상 딥러닝 처리

웹캠을 통해 받아온 실시간 영상을 서버로 전송하여 MediaPipe를 이용한 딥러닝 처리 후 Client에 송출해주는 프로젝트입니다.<br>

<img width="1470" alt="Screen Shot 2023-01-25 at 7 57 06 PM" src="https://user-images.githubusercontent.com/74334399/214546213-ed6f75d5-ecce-4759-bba4-0ed54d151e17.png">

> 저사양 서버 사용으로 인해 저해상도 영상으로 딥러닝 처리를 하여, 딥러닝 결과가 주변 환경에 영향을 많이 받는 점 참고해 주시면 감사합니다.

### 데모 페이지 - [https://goodgnadlabs.xyz](https://goodganglabs.xyz)

### API 명세 - [api.md](https://github.com/jcggl/test_realtimeapi/blob/main/documents/api.md)

<br>

데모 페이지는 데스크톱과 크롬 환경에 최적화되어 있으며, 지원 기기 및 브라우저는 아래를 참고해주시면 감사합니다.<br>

<img width="739" alt="Screen Shot 2023-01-25 at 8 33 25 PM" src="https://user-images.githubusercontent.com/74334399/214553152-d1389b66-0a7c-41aa-ad4b-0990ef58e836.png">

<br>

- ### [프로젝트 정보](./documents/information.md)
- ### [프로젝트 일정표](./documents/schedule.md)
- ### [프로젝트 설계도](./documents/blueprint.md)

<br>

## 📝 목차

### [1. 들어가기 앞서](#%EF%B8%8F-%EB%93%A4%EC%96%B4%EA%B0%80%EA%B8%B0-%EC%95%9E%EC%84%9C)

### [2. 프로젝트 실행](#%EF%B8%8F-%ED%94%84%EB%A1%9C%EC%A0%9D%ED%8A%B8-%EC%8B%A4%ED%96%89)

### [3. 화면 시연](#-%ED%99%94%EB%A9%B4-%EC%8B%9C%EC%97%B0)

### [4. 퇴고](#-%ED%87%B4%EA%B3%A0)

<br>

## 🙋‍♂️ 들어가기 앞서

#### 과제 요구사항과 개발을 진행하며 고려한 내역입니다.

<br>

### 🧐 요구 사항

- #### 데모 페이지

  - 무분별한 접속을 방지하고자 비밀번호 입력 페이지를 추가하였습니다.
  - P2P 형식의 서비스가 아닌, `단일 Streaming 서비스`를 구현하였습니다.

- #### Mediapipe

  - 서버 성능이 낮아 영상 Stream을 처리하는 방식이 아닌, 초당 20프레임으로 제한하여 딥러닝 과정을 최적화하였습니다.
  - 딥러닝 처리 가용성을 높이기 위해 영상 프레임을 Base64 인코딩하여 안정적인 이미지 처리를 위해 노력하였습니다.

- #### 배포
  - 개인 AWS EC2 환경에 배포를 진행하였습니다.
  - HTTPS 설정을 위해 `ACM` 및 `ALB` 서비스를 사용하였습니다.
  - `Route53` 서비스를 이용해 Public 도메인을 설정하였습니다.
  - 각 서비스는 Docker 컨테이너로 배포가 되어있습니다.
  - [프로젝트 설계도](./documents/blueprint.md)를 참고해주시면 감사합니다.

<br>

### 🧮 구현 과정

- #### 아키텍쳐

  - 모놀리식 아키텍쳐를 구성한다면 서버에 가해지는 부담이 커질 것을 우려해 `MSA 아키텍쳐`로 구성하였습니다.
  - WAS의 안정적인 데이터 처리를 위해 송/수신 역할을 분리하였습니다.
  - 모든 요청/응답을 `획일적으로 관리하기 위해 Nginx`를 추가하였습니다.

- #### 파이프라인

  - 확장 가능한 구조를 띄기 위해 서비스 간 직접 통신이 아닌 파이프라인을 구축하였습니다.
  - 불필요한 통신 오버헤드를 줄이기 위해 `Message Queue`를 이용하였습니다.
  - 서비스 특성상 `휘발성 데이터에 대한 부담`이 없어 Redis를 이용하였습니다.

- #### 딥러닝 처리 서버

  - 딥러닝 처리의 오버헤드가 커지는 현상을 해결하기위해 asyncio 비동기 라이브러리를 이용하였습니다.
  - 트래픽이 많아질 시를 대비하여 확장 가능한 구조로 설계하였습니다.

- #### 송/수신 서버
  - 영상 Stream과 딥러닝 Result로 도메인을 분리하여 송/수신 과정을 분리하였습니다.
  - Client를 uuid로 특정해 `stateful한 구조로 설계`하였습니다.
  - Redis를 이용하여 사용자 인증을 적용하였습니다.

<br>

## 🏃‍♂️ 프로젝트 실행

❗️ 들어가기 앞서 [프로젝트 버전 명세](https://github.com/jcggl/test_realtimeapi/blob/main/documents/information.md#-%EB%B2%84%EC%A0%84-%EB%AA%85%EC%84%B8)를 확인해 주시면 감사합니다.

<br>

#### 빌드 및 실행 전 환경 변수를 등록해야 합니다.

#### 환경 변수는 DM으로 보내드리겠습니다. 확인해 주시면 감사합니다.

<br>

> 환경 변수 등록

```SHELL
# 프로젝트 루트 폴더인 test_realtimeapi를 기준으로 합니다.

## Docker 빌드 시
$ touch .env

## 서비스 별 빌드 시
$ touch ./streaming_preprocess/.env.dev

위 파일을 생성한 뒤, DM으로 첨부드린 환경 변수 내용을 붙여 넣고 진행하시면 됩니다.
```

<br>

> Docker 빌드 시

```SHELL
$ docker-compose up --build

http://localhost 접속
```

<br>

> 서비스 별 빌드 시

```SHELL
# 빌드에 필요한 프로그램은 설치가 완료되어 있다고 가정한 뒤의 예시입니다.

# Redis
# host: 127.0.0.1, port: 6379를 기준으로 합니다.
$ redis-server

# Nginx
# streaming_router/server.conf 파일을 /etc/nginx/http.d/ 경로에 먼저 추가해야 합니다.
$ nginx -g

# Streaming 수신 서버
streaming_preprocess $ yarn
streaming_preprocess $ yarn start

# 딥러닝 결과 송신 서버
streaming_preprocess $ yarn
streaming_preprocess $ yarn start

# 딥러닝 처리 서버
streaming_deep_learning $ pip install -r requirements.txt
streaming_deep_learning $ python main.py

http://localhost:3000 접속
```

<br>

## 🖥 화면 시연

https://user-images.githubusercontent.com/74334399/214555628-d9d4bdcc-92bd-4d18-8a06-670664f3267c.mov

<br>

## 👣 퇴고

NestJS 기반 소켓 서버를 이용해 영상 Stream을 송/수신하였습니다.<br>
단순 딥러닝 처리 서버를 구상한다기보다, 확장 가능한 서버 구조를 설계하는데 많은 노력이 들어갔습니다.<br>
WebRTC를 이용한 P2P 딥러닝 스트리밍 서비스를 구현하고 싶었지만, 시간 제약상 구현하지 못한 부분이 아쉽게 다가오는것 같습니다. 😅<br>

<br>

그나마 괜찮은 결과를 위해 볼륨을 키웠는데, 좋은 결과로 돌아왔으면 좋겠습니다. 😂<br>
단순 기능 추가를 목적으로 하는것이 아닌, 코드 가독성/간결성, 획일화 된 구조, 확장 가능한 설계에 노력을 기울였습니다.<br>

<br>

짧고 굵게 진행된 프로젝트였지만, 굉장히 재밌게 진행한 프로젝트였습니다.<br>
구현하며 아쉬운 부분, 숨겨진 요소를 구현하며 흥미진진하게 진행했던 것 같습니다.<br>
구현 외적으로 생각할 부분이 많아, 덕분에 학습할 수 있는 계기가 되었습니다.<br>

<br>

좋은 기회 주셔서 정말 재밌게 프로젝트를 진행하였습니다! 감사합니다. 😄<br>

<br>
