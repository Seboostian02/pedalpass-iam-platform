FROM maven:3.9-eclipse-temurin-21-alpine AS build
WORKDIR /workspace

COPY pom.xml .
COPY common-lib/pom.xml common-lib/pom.xml
COPY common-lib/src common-lib/src
COPY user-service/pom.xml user-service/pom.xml
COPY user-service/src user-service/src

RUN cd /workspace && \
    mvn -N install -DskipTests -q && \
    mvn -f common-lib/pom.xml install -DskipTests -q && \
    mvn -f user-service/pom.xml clean package -DskipTests -q

FROM eclipse-temurin:21-jre-alpine
WORKDIR /app
COPY --from=build /workspace/user-service/target/*.jar app.jar
EXPOSE 8082
ENTRYPOINT ["java", "-jar", "app.jar"]
