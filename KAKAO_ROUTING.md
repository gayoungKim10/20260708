# 카카오 도보 라우팅 설정

러너 앱의 최종 경로는 카카오맵 도보 경로 API만 사용합니다. 브라우저는 같은 출처의
`POST /api/kakao-walk`를 호출하고, 서버 함수가 카카오 REST API 키를 붙여
`GET https://dapi.kakao.com/v2/routing/walk`를 호출합니다.

## 배포 설정

1. 카카오디벨로퍼스 앱에서 카카오맵 API를 활성화합니다.
2. 배포 환경의 서버 환경 변수에 `kakao_restapikey`를 등록합니다.
3. JavaScript 지도 SDK용 도메인은 별도로 카카오 앱에 등록합니다.

배포 환경에는 지도 SDK용 `KAKAO_JAVASCRIPT_KEY`도 등록해야 합니다. 빌드 과정에서
이 공개용 키를 SDK URL에 삽입하며, 값이 없으면 빌드가 중단됩니다.

REST API 키는 `index.html`, `env.js` 등 브라우저가 내려받는 파일에 넣지 않습니다.
`api/kakao-walk.js`는 Vercel Node.js 서버리스 함수 형식입니다.

## 응답 데이터 활용 범위

경로 선은 `route.legs[].steps[].path.points`의 `[경도, 위도]` 좌표만 이어 그립니다.
거리와 시간은 `route.properties.totalDistance`, `totalTime`을 사용합니다. 도보 단계의
`properties.guidance`에 `횡단보도`가 명시된 경우에만 횡단보도로 집계하고 해당 단계
시작 좌표를 표시합니다.

현재 공식 응답에는 횡단보도, 신호등, 보행로를 구조화한 전용 타입 필드가 없습니다.
따라서 안내 문구에 없는 횡단 시설을 추정하거나 기존 엑셀/CSV 좌표로 보정하지 않습니다.
