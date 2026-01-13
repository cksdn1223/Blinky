# 주요 UI 컴포넌트

## 1. PetCanvas (`components/PetCanvas.tsx`)

- **기술**: HTML5 Canvas API + `requestAnimationFrame`.
- **기능**:
  - 스프라이트 이미지(`cat-sprite.png`)를 로드하여 프레임 단위로 애니메이션 렌더링.
  - **상태 반영**: `idle`, `walk`, `run`, `sleep`, `pounce` 등 상태 문자열에 따라 다른 스프라이트 행(Row)을 참조.
  - **마우스 상호작용**: 마우스 오버 시 픽셀 데이터를 분석(`getImageData`)하여 고양이 위에 있는지 감지하고, 클릭 이벤트를 처리.

## 2. YouTubePlayer (`components/YoutubePlayer.tsx`)

- **기술**: YouTube IFrame API (native `window.YT.Player`).
- **기능**:
  - **재생/일시정지 동기화**: 방장(`isOwner`)의 조작에 따라 참여자들의 플레이어 상태를 동기화.
  - **시간 동기화**: 서버(Redis) 및 방장의 진행 시간(`progressMs`)과 참여자의 시간을 주기적으로(`setInterval`) 비교하여 2초 이상 차이날 경우 `seekTo` 수행.
  - **플레이리스트**: 클립보드에서 유튜브 URL을 감지하여 목록에 추가.

## 3. SocialPanel (`components/SocialPanel.tsx`)

- **기능**: 팔로잉/팔로워 목록을 탭으로 구분하여 표시.
- **실시간 상태**: 친구의 펫 상태나 접속 여부 등을 `UserItem` 컴포넌트를 통해 표시.

## 4. Equalizer (`components/Equalizer.tsx`)

- **기능**: 음악 재생(`isPlaying`) 상태에 따라 막대들이 움직이는 CSS/JS 애니메이션 시각화.
