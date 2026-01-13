# 백엔드 개요 (Backend Overview)

## 📁 프로젝트 구조 (Project Structure)

백엔드 코드는 `back/src/main/java/com/web/back` 패키지 하위에 구성되어 있으며, 기능별로 패키지가 분리되어 있습니다.

```
com.web.back
├── config          # 설정 파일 (Security, WebSocket, WebMvc)
├── controller      # API 엔드포인트 정의 (Controller)
├── dto             # 데이터 전송 객체 (Request/Response DTO)
├── entity          # 데이터베이스 엔티티 (JPA Entity)
├── enums           # 상수 정의 (UserRole, FriendStatus 등)
├── exception       # 전역 예외 처리 (GlobalExceptionHandler)
├── repository      # 데이터베이스 접근 계층 (JPA Repository)
├── security        # 인증/인가 관련 (JWT, OAuth2, UserDetails)
└── service         # 비즈니스 로직 (Service Layer)
```

## ⚙️ 주요 설정 (Configuration)

### 1. SecurityConfig (`security/SecurityConfig.java`)

- **OAuth2 Login**: Google 로그인을 지원합니다.
- **JWT Authentication**: 로그인 성공 시 JWT를 발급하고, 필터(`AuthenticationFilter`)를 통해 인가 처리를 수행합니다.
- **CORS**: 프론트엔드(localhost:5173 등)에서의 접근을 허용합니다.

### 2. WebSocketConfig (`config/WebSocketConfig.java`)

- 실시간 통신을 위한 웹소켓 설정이 포함되어 있을 수 있습니다 (의존성 확인됨).
- 또는 SSE(Server-Sent Events)를 주력으로 사용하여 `SseController`를 통해 실시간 이벤트를 전송합니다.

### 3. Database

- **MariaDB Driver**: 데이터 영속성을 위해 MariaDB를 사용합니다.
- **Redis**: 캐싱 또는 세션 정보, 혹은 실시간 데이터 처리를 돕기 위해 사용됩니다.
