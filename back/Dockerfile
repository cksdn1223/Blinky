# CI 파이프라인 전용 Dockerfile
# 이미 빌드된 JAR 파일을 복사하여 실행하는 런타임 전용 이미지입니다.
FROM eclipse-temurin:17-jre-alpine

WORKDIR /app

# 타임존 설정
ENV TZ=Asia/Seoul

# JAR 파일 복사
# GitHub Actions에서 download-artifact로 받아온 경로에 맞춰 복사
COPY build/libs/*.jar app.jar

EXPOSE 8080

# 보안을 위해 권한이 제한된 nobody 유저 사용 권장 (선택)
# USER nobody

ENTRYPOINT ["java", "-jar", "app.jar"]
