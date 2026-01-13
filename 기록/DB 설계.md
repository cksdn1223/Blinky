# 데이터베이스 설계

> **상세 스키마 문서는 [[10_Backend/03_Database]]를 참고하세요.**

## 핵심 엔티티

1. **User**: 사용자 정보 (UUID 식별자).
2. **Pet**: 사용자와 1:1로 매칭되는 펫 정보 (행복도/심심함 상태).
3. **FocusLog**: 사용자의 집중 시간 기록 (비디오 목록 포함).
4. **Friend**: 사용자 간의 팔로우/차단 관계 (다대다 해소).

## 주요 관계

- **User - Pet**: 1:1
- **User - FocusLog**: 1:N
- **User - User (Friend)**: N:M (Self Join 형태의 중간 테이블 `friends` 사용)
