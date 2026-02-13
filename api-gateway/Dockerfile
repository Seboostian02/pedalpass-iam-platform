FROM maven:3.9-eclipse-temurin-21-alpine AS build
WORKDIR /workspace

COPY pom.xml .
COPY common-lib/pom.xml common-lib/pom.xml
COPY common-lib/src common-lib/src
COPY api-gateway/pom.xml api-gateway/pom.xml
COPY api-gateway/src api-gateway/src

RUN cd /workspace && \
    mvn -N install -DskipTests -q && \
    mvn -f common-lib/pom.xml install -DskipTests -q && \
    mvn -f api-gateway/pom.xml clean package -DskipTests -q

FROM eclipse-temurin:21-jre-alpine
WORKDIR /app
COPY --from=build /workspace/api-gateway/target/*.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
