# ---- Build Stage ----
FROM eclipse-temurin:21-jdk-alpine AS build
WORKDIR /app

COPY pom.xml /app/parent-pom.xml
COPY common-lib/pom.xml /app/common-lib/pom.xml
COPY auth-service/pom.xml /app/auth-service/pom.xml

RUN --mount=type=cache,target=/root/.m2 \
    cd /app && mvn -f parent-pom.xml dependency:go-offline -pl auth-service -am -B 2>/dev/null || true

COPY common-lib/src /app/common-lib/src
COPY auth-service/src /app/auth-service/src

RUN --mount=type=cache,target=/root/.m2 \
    cd /app && mvn -f parent-pom.xml clean package -pl auth-service -am -DskipTests -B

# ---- Runtime Stage ----
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app

RUN addgroup -g 1001 -S hospital && \
    adduser -S hospital -u 1001 -G hospital

COPY --from=build /app/auth-service/target/*.jar app.jar

RUN chown hospital:hospital app.jar
USER hospital

EXPOSE 8081

HEALTHCHECK --interval=30s --timeout=10s --retries=3 --start-period=60s \
    CMD wget --no-verbose --tries=1 --spider http://localhost:8081/actuator/health || exit 1

ENTRYPOINT ["java", "-XX:+UseContainerSupport", "-XX:MaxRAMPercentage=75.0", "-jar", "app.jar"]
