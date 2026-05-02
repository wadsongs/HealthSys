FROM gradle:8.7-jdk21 AS build
WORKDIR /app

COPY build.gradle settings.gradle ./
COPY src ./src

RUN gradle clean bootJar --no-daemon -x test

FROM eclipse-temurin:21-jre-jammy
RUN apt-get update && apt-get install -y curl --no-install-recommends && rm -rf /var/lib/apt/lists/*
COPY --from=build /app/build/libs/*.jar app.jar

ENTRYPOINT ["java","-jar","/app.jar"]