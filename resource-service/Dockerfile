FROM maven:3.9-eclipse-temurin-21-alpine AS build
WORKDIR /workspace

COPY pom.xml .
COPY common-lib/pom.xml common-lib/pom.xml
COPY common-lib/src common-lib/src
COPY resource-service/pom.xml resource-service/pom.xml
COPY resource-service/src resource-service/src

RUN cd /workspace && \
    mvn -N install -DskipTests -q && \
    mvn -f common-lib/pom.xml install -DskipTests -q && \
    mvn -f resource-service/pom.xml clean package -DskipTests -q

FROM eclipse-temurin:21-jre-alpine
WORKDIR /app
COPY --from=build /workspace/resource-service/target/*.jar app.jar
EXPOSE 8083
ENTRYPOINT ["java", "-jar", "app.jar"]
