# 프로젝트 정보

프로젝트에 관한 정보입니다.

<br>

## 📝 목차

- [버전 명세](#-%EB%B2%84%EC%A0%84-%EB%AA%85%EC%84%B8)
- [깃 컨벤션](#-%EA%B9%83-%EC%BB%A8%EB%B2%A4%EC%85%98)
- [코드 컨벤션](#-%EC%BD%94%EB%93%9C-%EC%BB%A8%EB%B2%A4%EC%85%98)

<br>

## 📌 버전 명세

프로젝트를 진행하며 필수로 설치되어야 하는 도구의 버전을 명세한 것입니다.<br>

### Node.js

라이브러리의 자세한 버전은 다음을 참고해 주시면 감사합니다.<br>

- [streaming_preprocess](../streaming_preprocess/package.json)
- [streaming_postprocess](../streaming_postprocess/package.json)

<br>

| **yarn**을 이용해 `@nestjs/cli`를 설치하여 초기 보일러플레이트 코드를 작성하였습니다.

```PLAIN
Node.js     : 18.12.1 (Alpine linux 3.17에서 지원하는 최신 LTS 버전)
yarn        : 1.22.19

nest        : 9.1.8
typescript  : 4.7.4
```

<br>

### Python

라이브러리의 자세한 버전은 다음을 참고해 주시면 감사합니다.<br>

- [requirements.txt](../streaming_deep_learning/requirements.txt)

<br>

```
python      : 3.10.9
```

<br>

### ETC

```
python      : 7.0.7
nginx       : 1.22.1
```
<br>

## 💬 깃 컨벤션

[GPG](https://gnupg.org/)키를 기반하여 Git Commit 서명을 적용합니다.<br>

<br>

아래는 Git commit 예시 입니다.

> Issue Number [Commit Type] Commit Message

- Add : 주요 작업이 무언가를 추가하는 경우
- Fix : 주요 작업이 무언가를 고치는 경우
- Change : 주요 작업이 무언가를 변경하는 경우
- Improve : 주요 작업이 무언가를 개선하는 경우

<br>

Commit Message는 최대한 한글로 작성하며, Commit Tag와 공백 1칸으로 구분합니다.

```SHELL
# Commit example

git commit -m "#1 [Add] ~~~ 작업을 수행하는 모듈 추가"

git commit -m "#1 [Change] ~~~ 비즈니스 로직에서 불필요한 ~~~를 제거"

git commit -m "#1 [Fix] 기존에 작성된 ~~~가 정상적인 기대 값을 주지 않는 문제를 해결"

git commit -m "#1 [Improve] ~~~ 비즈니스 로직에서 발생하는 중첩을 제거하여 성능을 개선"
```

<br>

## 🎨 코드 컨벤션

기본적으로 [Prettier](https://github.com/prettier/prettier), [Eslint](https://eslint.org/)를 이용하여 개발합니다.<br>

`Clean Code`를 준수한 개발을 진행하며, 기본적인 컨벤션은 아래를 따릅니다.<br>

```PALIN
Identation    : space
Tab size      : 2
Max width     : 120
Quote         : single
End of line   : true
Semicolon     : true
```
