FROM maven:3.9-eclipse-temurin-21-alpine AS build
WORKDIR /workspace

# Copy parent POM and common-lib first (for Docker layer caching)
COPY pom.xml .
COPY common-lib/pom.xml common-lib/pom.xml
COPY common-lib/src common-lib/src
COPY auth-service/pom.xml auth-service/pom.xml
COPY auth-service/src auth-service/src

# Install parent POM, then common-lib, then auth-service
RUN cd /workspace && \
    mvn -N install -DskipTests -q && \
    mvn -f common-lib/pom.xml install -DskipTests -q && \
    mvn -f auth-service/pom.xml clean package -DskipTests -q

FROM eclipse-temurin:21-jre-alpine
WORKDIR /app
COPY --from=build /workspace/auth-service/target/*.jar app.jar
EXPOSE 8081
ENTRYPOINT ["java", "-jar", "app.jar"]
