# 아키텍처 및 기술 스택

## 🏗️ 시스템 아키텍처

Blinky 프로젝트는 **Spring Boot** 기반의 백엔드와 **React (Vite)** 기반의 프론트엔드로 구성된 모던 웹 애플리케이션입니다.

```mermaid
graph TD
    User[Client (Browser)]

    subgraph Frontend [Frontend (React + Vite)]
        UI[UI Components]
        Store[Zustand Store]
        API[API Client (Axios)]
        UI --> Store
        Store --> UI
        UI --> API
    end

    subgraph Backend [Backend (Spring Boot)]
        Controller[Rest Controllers]
        Service[Service Layer]
        Repository[JPA Repositories]
        Security[Spring Security (JWT/OAuth2)]
        SSE[SSE Emitter]

        Controller --> Service
        Service --> Repository
        Controller -- "Auth" --> Security
        Controller -- "Real-time" --> SSE
    end

    subgraph Database
        MariaDB[(MariaDB)]
        Redis[(Redis)]
    end

    User --> Frontend
    API -- "HTTP / REST" --> Controller
    API -- "SSE (EventStream)" --> SSE
    Repository --> MariaDB
    Service --> MariaDB
    Service -.-> Redis
```

## 🛠️ 기술 스택 (Tech Stack)

### Backend (Server)

| 구분           | 기술                     | 버전/설명            |
| :------------- | :----------------------- | :------------------- |
| **Language**   | Java                     | 17                   |
| **Framework**  | Spring Boot              | 3.5.9                |
| **Build Tool** | Gradle                   |                      |
| **Package**    | `com.web.back`           | 기본 패키지 경로     |
| **Database**   | MariaDB                  | 10.11 (Docker)       |
| **Cache**      | Redis                    | Alpine (Docker)      |
| **Security**   | Spring Security          | JWT, OAuth2 (Google) |
| **Real-time**  | SSE (Server-Sent Events) | `SseEmitter`         |
| **Docs**       | Swagger (SpringDoc)      | v2.8.13              |

### Frontend (Client)

| 구분            | 기술          | 버전/설명                      |
| :-------------- | :------------ | :----------------------------- |
| **Language**    | TypeScript    | v5.0+                          |
| **Framework**   | React         | v18.2, Vite v4.4               |
| **Styling**     | Tailwind CSS  | v3.4                           |
| **State Mgmt**  | Zustand       | v5.0 (Persist middleware 사용) |
| **HTTP Client** | Axios         | v1.13                          |
| **Animation**   | Framer Motion | v12.23                         |
| **Media**       | React Player  | YouTube 재생                   |

## 🔑 주요 기능

1. **Focus Session**: 타이머를 이용한 집중 시간 기록 및 관리.
2. **Pet Raising**: 집중 시간에 따라 펫(Blinky)의 상태(행복도, 심심함)가 변화.
3. **Social**: 사용자 검색, 팔로우/팔로잉, 친구 펫 구경.
4. **Music Sharing**: 실시간 룸(SSE)을 통해 같은 음악을 동시에 감상.
