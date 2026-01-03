# 데이터베이스 설계
핵심은 유저, 펫, 활동로그

주요 테이블
Users, Pets, FocusLogs, Friends

## Users
- Id 유저 고유 식별자
- email 로그인용 이메일
- nickname 서비스 내 활동 이름
- total_focus_sec 전체 누적 집중 시간(초)
- created_at 가입 일시

## Pets
유저와 1대1 관계
- Id 펫 고유 ID
- user_id 주인 유저 ID
- name 펫 이름
- happiness 행복도
- boredom 심심함 지수 0~100

## FocusLogs 
세션이 종료될때마다 기록
- Id 로그 고유 번호
- user_id 기록 주체 유저
- start_at 세션 시작 시간
- end_at 세션 종료 시간
- video_ids 들었던 유튜브 영상 ID (여러개)

## Friend
소셜 기능을 위한 다대다 관계 테이블
- id 관계 ID
- follower_id 팔로우를 누른 유저
- following_id 팔로우 대상 유저
- status 관계 상태(active, blocked ...)
- created_at 관계 생성 일시

