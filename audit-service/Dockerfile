FROM maven:3.9-eclipse-temurin-21-alpine AS build
WORKDIR /workspace

COPY pom.xml .
COPY common-lib/pom.xml common-lib/pom.xml
COPY common-lib/src common-lib/src
COPY audit-service/pom.xml audit-service/pom.xml
COPY audit-service/src audit-service/src

RUN cd /workspace && \
    mvn -N install -DskipTests -q && \
    mvn -f common-lib/pom.xml install -DskipTests -q && \
    mvn -f audit-service/pom.xml clean package -DskipTests -q

FROM eclipse-temurin:21-jre-alpine
WORKDIR /app
COPY --from=build /workspace/audit-service/target/*.jar app.jar
EXPOSE 8084
ENTRYPOINT ["java", "-jar", "app.jar"]
