# 프론트엔드 개요 (Frontend Overview)

## 📁 프로젝트 구조 (Project Structure)

프론트엔드 코드는 `front/src` 경로에 있으며, React + Vite + TypeScript 환경에서 개발되었습니다.

```
front/src
├── api             # Axios 인스턴스 및 API 호출 함수 정의
├── assets          # 이미지, 폰트 등 정적 리소스
├── components      # UI 컴포넌트 (PetCanvas, YouTubePlayer 등)
├── hooks           # 커스텀 훅 (useBlinkyLogic, useSse 등)
├── store           # 전역 상태 관리 (Zustand)
├── App.tsx         # 메인 애플리케이션 컴포넌트
├── main.tsx        # 진입점 (Entry Point)
└── types.ts        # 공용 타입 정의
```

## 🛠️ 주요 라이브러리 (Key Libraries)

- **React (`v18`)**: UI 라이브러리.
- **Vite**: 초고속 빌드 툴.
- **TypeScript**: 정적 타입 지원.
- **Tailwind CSS (`v3.4`)**: 유틸리티 퍼스트 CSS 프레임워크.
- **Zustand (`v5.0`)**: 간결하고 강력한 상태 관리 라이브러리 (Redux 대체).
- **Axios**: HTTP 클라이언트.
- **Framer Motion**: 부드러운 UI 애니메이션.
- **Canvas Confetti**: 축하 효과 애니메이션.
