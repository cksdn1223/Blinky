# 프론트엔드 개요 (Frontend Overview)

## 📁 프로젝트 구조 (Project Structure)

프론트엔드는 **React**와 **Vite**로 빌드되었으며, `front/src` 하위에 위치합니다.

```
front/src
├── api             # 백엔드 통신 함수 (Axios Wrapper)
├── assets          # 이미지, 폰트 등 정적 자산
├── components      # 재사용 가능한 UI 컴포넌트
├── hooks           # 커스텀 훅 (useBlinkyLogic, useSse 등)
├── store           # 전역 상태 관리 (Zustand)
├── App.tsx         # 메인 레이아웃 및 라우팅/로직 조합
└── main.tsx        # 진입점 (Entry Point)
```

## ⚙️ 주요 라이브러리 (Key Libraries)

- **Vite**: 빠른 빌드 및 개발 환경 제공.
- **Tailwind CSS**: 유틸리티 퍼스트 CSS 프레임워크. `index.css` 및 `tailwind.config.js`에 테마(컬러 팔레트 등)가 설정되어 있습니다.
- **Zustand**: 가볍고 강력한 전역 상태 관리 라이브러리. `persist` 미들웨어를 사용하여 새로고침 후에도 상태(토큰 등)를 유지합니다.
- **Framer Motion**: 부드러운 UI 애니메이션 구현.
- **React Player**: 유튜브 영상 재생 및 제어.
- **Canvas Confetti**: 목표 달성 시 축하 효과 등 시각적 피드백.

## 🎨 스타일링 및 테마

- **반응형 디자인**: Tailwind의 `sm`, `md`, `lg` 등을 활용.
- **다이나믹 UI**: 펫의 상태(심심함, 행복함)에 따라 테두리 색상(`border-red-600` 등)이나 그림자 효과가 실시간으로 변합니다 (App.tsx 참조).
