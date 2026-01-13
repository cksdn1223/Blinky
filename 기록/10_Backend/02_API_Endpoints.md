# API Endpoints

## 1. User & Auth (`/api/user`)

| Method | Endpoint              | Description          | Request                 | Response                      |
| :----- | :-------------------- | :------------------- | :---------------------- | :---------------------------- |
| `GET`  | `/api/user/stats`     | 내 정보 및 통계 조회 | `Header: Authorization` | `UserResponseDto`             |
| `PUT`  | `/api/user/nickname`  | 닉네임 변경          | `Query: nickname`       | -                             |
| `GET`  | `/api/user/search`    | 사용자 검색          | `Query: nickname`       | `List<UserSearchResponseDto>` |
| `GET`  | `/api/user/following` | 팔로잉 목록 조회     | -                       | `List<UserSearchResponseDto>` |
| `GET`  | `/api/user/follower`  | 팔로워 목록 조회     | -                       | `List<UserSearchResponseDto>` |

## 2. Focus Session (`/api/focus`)

| Method | Endpoint         | Description                 | Request                 | Response           |
| :----- | :--------------- | :-------------------------- | :---------------------- | :----------------- |
| `POST` | `/api/focus/end` | 집중 세션 종료 및 기록 저장 | `Body: FocusRequestDto` | `FocusResponseDto` |

## 3. Pet (`/api/pet`)

| Method | Endpoint            | Description               | Request           | Response               |
| :----- | :------------------ | :------------------------ | :---------------- | :--------------------- |
| `PUT`  | `/api/pet/nickname` | 펫 이름 변경              | `Query: nickname` | -                      |
| `POST` | `/api/pet/interact` | 펫 상호작용 (쓰다듬기 등) | -                 | `PetStatusResponseDto` |

## 4. Social & Friend (`/api/friend`)

| Method | Endpoint      | Description                   | Request        | Response |
| :----- | :------------ | :---------------------------- | :------------- | :------- |
| `POST` | `/api/friend` | 팔로우 토글 (Follow/Unfollow) | `Query: email` | -        |
| `PUT`  | `/api/friend` | 팔로워 차단/삭제              | `Query: email` | -        |

## 5. Room & Sharing (`/api/room`, `/api`)

| Method | Endpoint                      | Description                   | Request          | Response                  |
| :----- | :---------------------------- | :---------------------------- | :--------------- | :------------------------ |
| `GET`  | `/api/connect/{email}`        | SSE 연결 (실시간 이벤트 수신) | -                | `SseEmitter`              |
| `POST` | `/api/room/join/{ownerEmail}` | 음악 공유 방 입장             | -                | `message`, `currentMusic` |
| `POST` | `/api/room/leave`             | 음악 공유 방 퇴장             | -                | `message`                 |
| `POST` | `/api/share/{ownerEmail}`     | 음악 재생 상태 공유 (Sync)    | `Body: MusicDto` | -                         |
