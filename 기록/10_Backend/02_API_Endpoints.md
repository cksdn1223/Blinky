# API 엔드포인트 상세 (API Endpoints)

## 👤 User API (`UserController`)

| Method | URL                   | Description             | Request           | Response                      |
| :----- | :-------------------- | :---------------------- | :---------------- | :---------------------------- |
| `GET`  | `/api/user/stats`     | 내 정보 및 펫 정보 조회 | Header(Token)     | `UserResponseDto`             |
| `PUT`  | `/api/user/nickname`  | 유저 닉네임 변경        | Query(`nickname`) | Void                          |
| `GET`  | `/api/user/search`    | 유저 검색               | Query(`nickname`) | `List<UserSearchResponseDto>` |
| `GET`  | `/api/user/following` | 팔로잉 목록 조회        | Header(Token)     | `List<UserSearchResponseDto>` |
| `GET`  | `/api/user/follower`  | 팔로워 목록 조회        | Header(Token)     | `List<UserSearchResponseDto>` |

## 🐾 Pet API (`PetController`)

| Method | URL                 | Description          | Request           | Response               |
| :----- | :------------------ | :------------------- | :---------------- | :--------------------- |
| `PUT`  | `/api/pet/nickname` | 펫 이름 변경         | Query(`nickname`) | Void                   |
| `POST` | `/api/pet/interact` | 펫과 상호작용 (터치) | Header(Token)     | `PetStatusResponseDto` |

## 🤝 Friend API (`FriendController`)

| Method | URL           | Description                   | Request        | Response |
| :----- | :------------ | :---------------------------- | :------------- | :------- |
| `POST` | `/api/friend` | 팔로우 토글 (Follow/Unfollow) | Param(`email`) | Void     |
| `PUT`  | `/api/friend` | 팔로워 차단                   | Param(`email`) | Void     |

## ⏳ Focus API (`FocusController`)

| Method | URL              | Description                 | Request                 | Response           |
| :----- | :--------------- | :-------------------------- | :---------------------- | :----------------- |
| `POST` | `/api/focus/end` | 집중 세션 종료 및 기록 저장 | Body(`FocusRequestDto`) | `FocusResponseDto` |

## 🏠 Room & Share API (`RoomController`, `SseController`)

| Method | URL                           | Description              | Request                              | Response             |
| :----- | :---------------------------- | :----------------------- | :----------------------------------- | :------------------- |
| `POST` | `/api/room/join/{ownerEmail}` | 다른 유저의 방 입장      | Path(`ownerEmail`)                   | Map (Message, Music) |
| `POST` | `/api/room/leave`             | 방 퇴장                  | Header(Token)                        | String               |
| `GET`  | `/api/connect/{email}`        | SSE 연결 (실시간 이벤트) | Path(`email`)                        | `SseEmitter`         |
| `POST` | `/api/share/{ownerEmail}`     | 음악 공유/동기화         | Path(`ownerEmail`), Body(`MusicDto`) | Void                 |
