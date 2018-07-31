# hero-banner-ui

## dev
데이터를 받아올 mock server를 실행합니다.

`/mockserver`
```bash
// 패키지를 먼저 설치합니다.
npm install
// mock server 실행
npm start
```

UI 모듈 개발용 webpack-dev-server를 실행합니다.

`/`
```bash
// 패키지를 먼저 설치합니다.
npm install
// dev-server 실행
npm run start
```

`localhost:8080`로 접속합니다.

## usage
```javascript
import HeroBanner from 'HeroBanner.js'

var hb = new HeroBanner(
    el: '<클래스네임>' // 슬라이드 모듈을 넣을 elements를 바인딩합니다.
    opt: {
        infinity: true, // 무한 슬라이드 옵션을 설정합니다. 기본 설정 true
        autoSlide: false // 자동 슬라이드 옵션을 설정합니다. 기본 설정 false
    }
)
```