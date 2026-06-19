FROM eclipse-temurin:21-jdk-alpine AS build
WORKDIR /app
COPY pom.xml /app/parent-pom.xml
COPY common-lib/pom.xml /app/common-lib/pom.xml
COPY billing-service/pom.xml /app/billing-service/pom.xml
RUN --mount=type=cache,target=/root/.m2 cd /app && mvn -f parent-pom.xml dependency:go-offline -pl billing-service -am -B 2>/dev/null || true
COPY common-lib/src /app/common-lib/src
COPY billing-service/src /app/billing-service/src
RUN --mount=type=cache,target=/root/.m2 cd /app && mvn -f parent-pom.xml clean package -pl billing-service -am -DskipTests -B

FROM eclipse-temurin:21-jre-alpine
WORKDIR /app
RUN addgroup -g 1001 -S hospital && adduser -S hospital -u 1001 -G hospital
COPY --from=build /app/billing-service/target/*.jar app.jar
RUN chown hospital:hospital app.jar
USER hospital
EXPOSE 8086
HEALTHCHECK --interval=30s --timeout=10s --retries=3 --start-period=60s CMD wget --no-verbose --tries=1 --spider http://localhost:8086/actuator/health || exit 1
ENTRYPOINT ["java", "-XX:+UseContainerSupport", "-XX:MaxRAMPercentage=75.0", "-jar", "app.jar"]
