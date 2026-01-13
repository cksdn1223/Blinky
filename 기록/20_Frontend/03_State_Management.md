# 상태 관리 (State Management)

이 프로젝트는 **Zustand**를 사용하여 전역 상태를 관리합니다. `src/store/store.ts` 파일에 모든 스토어가 정의되어 있습니다.

## 💾 Persist Stores (로컬 스토리지 저장)

새로고침 후에도 데이터가 유지되어야 하는 스토어들은 `persist` 미들웨어를 사용합니다.

### 1. useAuthStore

- **역할**: 인증 정보 관리.
- **State**: `token` (JWT 토큰).
- **Actions**:
  - `setToken`: 로그인 시 토큰 저장.
  - `logout`: 토큰 삭제 및 유저 정보 초기화.

### 2. useMusicStore

- **역할**: 멀티유저 음악 공유 상태 관리.
- **State**: `currentRoomMusic` (비디오 ID, 재생 상태, 진행도).
- **Storage Key**: `music-storage`.

### 3. useRoomStore

- **역할**: 현재 접속 중인 방 정보 관리.
- **State**: `currentRoomOwnerEmail`, `currentRoomOwnerNickname`.

## ⚡ Volatile Stores (휘발성)

### 1. useUserStore

- **역할**: 로그인한 사용자 및 펫의 상세 정보.
- **State**: `userStats` (닉네임, 펫 상태, 총 집중 시간 등).
- **Update Logic**: 세션 종료 후 서버에서 받은 최신 데이터로 업데이트(`updateAfterSession`).

### 2. useSessionStore

- **역할**: 현재 진행 중인 집중 세션(타이머) 관리.
- **State**: `startTime` (시작 시간), `sessionTime` (경과 시간), `currentVideoIds` (시청한 비디오 목록).
- **Actions**: `tick` (1초마다 호출되어 시간 갱신), `resetSession`.

### 3. useSocialStore

- **역할**: 팔로잉/팔로워 목록 관리.
- **State**: `lists` (`FOLLOWING`, `FOLLOWER` 배열).
- **Actions**: `fetchFriendsList`, `addFollowingToList`, `removeUserFromList`.

### 4. useUIStore

- **역할**: 설정창, 소셜 패널 등의 열림/닫힘 상태(Boolean) 관리.
