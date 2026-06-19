# ---- Build Stage ----
FROM eclipse-temurin:21-jdk-alpine AS build
WORKDIR /app

# Copy parent POM and common-lib first for better caching
COPY pom.xml /app/parent-pom.xml
COPY common-lib/pom.xml /app/common-lib/pom.xml
COPY discovery-service/pom.xml /app/discovery-service/pom.xml

# Download dependencies
RUN --mount=type=cache,target=/root/.m2 \
    cd /app && mvn -f parent-pom.xml dependency:go-offline -pl discovery-service -am -B 2>/dev/null || true

# Copy source code
COPY common-lib/src /app/common-lib/src
COPY discovery-service/src /app/discovery-service/src

# Build the service
RUN --mount=type=cache,target=/root/.m2 \
    cd /app && mvn -f parent-pom.xml clean package -pl discovery-service -am -DskipTests -B

# ---- Runtime Stage ----
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app

RUN addgroup -g 1001 -S hospital && \
    adduser -S hospital -u 1001 -G hospital

COPY --from=build /app/discovery-service/target/*.jar app.jar

RUN chown hospital:hospital app.jar
USER hospital

EXPOSE 8761

HEALTHCHECK --interval=30s --timeout=10s --retries=3 --start-period=40s \
    CMD wget --no-verbose --tries=1 --spider http://localhost:8761/actuator/health || exit 1

ENTRYPOINT ["java", "-XX:+UseContainerSupport", "-XX:MaxRAMPercentage=75.0", "-jar", "app.jar"]
