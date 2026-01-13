# 상태 관리 (State Management)

본 프로젝트는 **Zustand**를 사용하여 전역 상태를 관리합니다. `src/store/store.ts` 파일에 모든 스토어가 정의되어 있습니다.

## 스토어 목록

### 1. useAuthStore

- **역할**: 인증 정보 관리.
- **주요 상태**: `token` (JWT).
- **특징**: `persist` 미들웨어를 사용하여 `localStorage`에 자동 저장됩니다.

### 2. useUserStore

- **역할**: 로그인한 사용자의 정보 및 펫 상태 관리.
- **주요 상태**: `userStats` (닉네임, 이메일, 펫 상태 등), `isLoading`.
- **기능**: 유저 정보 Fetch, 닉네임 업데이트, 세션 종료 후 통계 업데이트.

### 3. useSessionStore

- **역할**: 현재 진행 중인 집중 세션(타이머) 관리.
- **주요 상태**: `sessionTime` (진행 시간), `startTime`, `isPlaying` (음악 재생 여부), `currentVideoIds` (시청한 비디오 목록).
- **기능**: 1초마다 `tick` 실행, 세션 리셋.

### 4. useRoomStore & useMusicStore

- **역할**: 음악 공유 방(Social Room) 관리.
- **특징**: `persist`를 사용하여 새로고침 시에도 방 정보와 음악 상태를 유지합니다.
- **주요 상태**:
  - `Room`: `currentRoomOwnerEmail`.
  - `Music`: `currentRoomMusic` (videoId, progress, playing state).

### 5. useUIStore & useSocialStore

- **역할**: UI 패널(설정, 친구 목록)의 열림/닫힘 상태 및 친구 목록 데이터 관리.
