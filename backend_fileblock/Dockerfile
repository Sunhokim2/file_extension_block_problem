FROM eclipse-temurin:21-jdk-jammy AS builder
WORKDIR /app

COPY gradlew .
COPY settings.gradle .
COPY build.gradle .
COPY gradle/wrapper/ gradle/wrapper/

COPY src ./src

# 프로젝트 빌드 및 JAR 파일 생성
RUN chmod +x ./gradlew
RUN ./gradlew bootJar --no-daemon

FROM eclipse-temurin:21-jre-jammy
WORKDIR /app

COPY --from=builder /app/build/libs/*.jar app.jar

# Spring Boot가 사용할 포트
EXPOSE 8080

ENTRYPOINT ["java", "-jar", "app.jar"]