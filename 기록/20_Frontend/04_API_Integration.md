# API 연동 (API Integration)

## 1. Axios 클라이언트 설정 (`api/client.ts`)

`axios` 라이브러리를 사용하여 HTTP 요청을 처리하며, 인터셉터(Interceptor)를 통해 공통 로직을 관리합니다.

- **Request Interceptor**:
  - `useAuthStore`에서 JWT 토큰을 가져와 `Authorization` 헤더에 `Bearer {token}` 형태로 자동 추가합니다.
  - `Content-Type`을 기본적으로 `application/json`으로 설정합니다.
- **Response Interceptor**:
  - 401 Unauthorized 에러 발생 시, `useAuthStore.getState().logout()`을 호출하여 클라이언트 측 로그아웃 처리를 수행하고 경고창을 표시합니다.

## 2. API 함수 목록 (`api/api.ts`)

주요 기능을 수행하기 위해 서버 엔드포인트를 호출하는 함수들입니다.

### User & Pet

- **getUserStats()**: `GET /api/user/stats` - 내 정보 조회.
- **changePetNickname(nickname)**: `PUT /api/pet/nickname` - 펫 이름 변경.
- **interactPet()**: `POST /api/pet/interact` - 펫 상호작용.

### Focus Session

- **sendEnd(startTime, videoIds, happiness, boredom, token)**: `POST /api/focus/end`
  - 세션 종료 시 집중 시간과 시청한 비디오 목록을 서버로 전송합니다.
  - `keepalive: true` 옵션을 사용하여 브라우저 창이 닫히더라도 요청이 전송되도록 처리합니다(Fetch API 사용).

### Social & Room

- **toggleFollow(email)**: `POST /api/friend`.
- **joinRoom(email)** / **leaveRoom()**: 방 입장 및 퇴장.
- **shareMusic(ownerEmail, data)**: `POST /api/share/{ownerEmail}`
  - 방장이 현재 재생 상태(시간, 비디오ID, 재생여부)를 서버에 전송하여 참여자들과 동기화합니다.
