FROM maven:3.9.9-eclipse-temurin-21 AS build
WORKDIR /app
COPY pom.xml .
COPY src ./src
RUN mvn clean install -DskipTests

FROM eclipse-temurin:21
WORKDIR /app
COPY --from=build /app/target/facelinked-0.0.1-SNAPSHOT.jar ./facelinked.jar
EXPOSE 8080
CMD ["java", "-jar", "aws.jar"]