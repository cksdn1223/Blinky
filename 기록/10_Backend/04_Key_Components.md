# 주요 컴포넌트 및 비즈니스 로직

## 1. 실시간 통신 (Real-time Communication)

서버는 **SSE (Server-Sent Events)** 를 사용하여 별도의 소켓 연결 부하 없이 단방향 실시간 이벤트를 클라이언트에 전송합니다.

### SseService (`service/sse/SseService.java`)

- **Connection**: `/api/connect/{email}` 엔드포인트를 통해 연결됩니다. 연결 시 `SseEmitter`를 메모리(`ConcurrentHashMap`)에 저장합니다.
- **Heartbeat**: 30초마다 모든 연결된 클라이언트에게 `ping` 이벤트를 전송하여 연결 유지 및 Redis 상태 갱신을 수행합니다.
- **Broadcast**: `rooms` 정보를 기반으로 특정 방의 참여자들에게만 이벤트를 전송합니다.

### RoomService (`service/room/RoomService.java`)

- **Redis 기반 상태 관리**:
  - `room:{ownerEmail}` (Set): 방 참여자 목록 저장.
  - `user:location:{email}` (String): 유저가 현재 어느 방에 있는지 저장.
  - `room:music:{ownerEmail}` (String): 방에서 현재 재생 중인 음악 정보(JSON) 저장.
- **Logic**:
  - **Join**: 최대 10명 제한. 중복 입장 체크.
  - **Sync**: 방장이 음악 상태(재생/일시정지, 시간)를 변경하면 `SseService`를 통해 방의 모든 인원에게 `music-sync` 이벤트를 전송합니다.

## 2. 펫 육성 로직 (Pet Logic)

펫의 상태는 **행복도(Happiness)** 와 **심심함(Boredom)** 두 가지 지표로 관리됩니다.

### PetEntity & Service

- **시간 기반 상태 변화**:
  - `Pet` 엔티티는 `lastUpdated` 필드를 가지고 있어, 조회 시점(`getCalculatedBoredom` 등)에 시간 차이를 계산하여 상태를 동적으로 반환합니다.
  - **심심함 증가**: 초당 약 `0.028` 증가 (시간이 지나면 심심해짐). 100이 최대.
  - **행복도 감소**: 초당 약 `0.00055` 감소 (시간이 지나면 행복도 떨어짐). 0이 최소.
- **상호작용 (`interactWithPet`)**:
  - 쓰다듬기 등의 상호작용 시 심심함이 30 감소하고, 행복도가 1 증가합니다.

## 3. 집중 세션 (Focus Session)

### FocusService (`service/FocusService.java`)

- **세션 종료 (`finishSession`)**:
  - 타이머 종료 시 클라이언트에서 요청을 보냅니다.
  - **시간 보상**: 집중한 시간(초)에 비례하여 펫의 행복도가 증가합니다 (`1시간 = +1 행복도`).
  - **기록 저장**: `FocusLog`에 시작/종료 시간 및 시청한 비디오 목록을 저장합니다.
- **데이터 정리**: 스케줄러(`@Scheduled`)가 매일 새벽에 실행되어 90일이 지난 오래된 로그를 삭제합니다.
