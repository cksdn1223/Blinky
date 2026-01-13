# 주요 컴포넌트 (Key Components)

## 📺 YoutubePlayer (`components/YoutubePlayer.tsx`)

유튜브 영상을 배경 음악으로 재생하는 컴포넌트입니다.

- `react-player` 라이브러리를 래핑.
- **기능**:
  - `onVideoChange`: 영상 ID가 변경될 때 상위 컴포넌트에 알림 (집중 세션에 기록).
  - `setIsPlaying`: 재생/일시정지 상태 동기화.

## 🐱 PetCanvas (`components/PetCanvas.tsx`)

펫(Blinky)을 캔버스(Canvas)에 렌더링하고 애니메이션을 처리합니다.

- **인터랙션**: 클릭 시 `onPetClick` 콜백 호출 (쓰다듬기).
- **상태 시각화**: `status` prop(`sleep`, `happy`, `bored` 등)에 따라 다른 스프라이트나 애니메이션을 보여줍니다.

## ⏲️ Clock (`components/Clock.tsx`)

현재 시간을 보여주는 심플한 시계 컴포넌트입니다.

## ⚙️ SettingPanel (`components/SettingPanel.tsx`)

사용자 설정을 변경하는 패널입니다.

- 닉네임 변경 (User, Pet).
- 오버레이 형태로 표시되며 `useUIStore`로 열림 상태를 제어합니다.

## 👥 SocialPanel (`components/SocialPanel.tsx`)

소셜 기능을 담당하는 패널입니다.

- **탭 구분**: 팔로잉(Following) / 팔로워(Follower) 목록 전환.
- **친구 검색**: 닉네임으로 유저 검색 후 팔로우/언팔로우.
- **상태 표시**: 친구의 펫 상태나 현재 듣고 있는 음악 여부 표시.
