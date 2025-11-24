# Fazenda Backend (Java/Spring Boot)

This is the migrated backend for the Fazenda application, built with Java 17 and Spring Boot 3.

## Prerequisites

- Java 17+
- Maven
- PostgreSQL

## Configuration

Update `src/main/resources/application.properties` with your database credentials:

```properties
spring.datasource.url=jdbc:postgresql://localhost:5432/fazenda
spring.datasource.username=your_username
spring.datasource.password=your_password
```

## Running the Application

```bash
mvn spring-boot:run
```

## API Endpoints

- `/api/fazendas`
- `/api/animais`
- ... (others to be implemented)
