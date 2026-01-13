# API 연동 (API Integration)

프론트엔드는 **Axios** 라이브러리를 통해 백엔드와 통신하며, 모든 API 함수는 `src/api/api.ts`에 정의되어 있습니다.

## 📡 API Client (`src/api/client.ts`)

- `axios.create()`를 사용하여 기본 `baseURL`이 설정된 인스턴스를 생성하여 사용합니다.
- `baseURL`은 환경 변수 `VITE_BASE_URL`을 참조합니다.

## 📦 주요 함수 (Key Functions)

### User & Pet

- **`getUserStats()`**: 로그인한 사용자의 정보(펫 포함)를 가져옵니다.
- **`changeUserNickname(nickname)`**: 유저 닉네임 변경.
- **`changePetNickname(nickname)`**: 펫 닉네임 변경.
- **`interactPet()`**: 펫 쓰다듬기 요청.

### Social

- **`searchUser(nickname)`**: 닉네임으로 유저 검색.
- **`toggleFollow(email)`**: 팔로우/언팔로우 토글.
- **`blockFollower(email)`**: 나를 팔로우한 유저 차단.
- **`getFollowings()`, `getFollowers()`**: 목록 조회.

### Session (Focus)

- **`sendEnd(startTime, videoIds, ...)`**: 집중 세션 종료 시 호출.
  - **Params**: 시작 시간, 시청한 비디오 ID 목록, 최종 펫 상태.
  - **Return**: 업데이트된 총 집중 시간.

### Room & Sharing

- **`joinRoom(email)`**: 친구의 방에 입장.
- **`shareMusic(ownerEmail, data)`**: 현재 재생 중인 음악 정보를 방(Owner)에 공유하여 동기화.
