# Roasting Monitor — Java Spring Boot + Angular + PostgreSQL

This project converts the supplied static Roasting Monitor POC into a real three-tier application.

## POC features carried over
- Operator and Admin roles
- Operator: create roasting batch and see last 10 batches
- Per-material stock and standard loss percentage
- Live input/output/loss/standard-loss/variance calculation
- Admin dashboard with date range summary
- Admin raw-material catalog and add-material flow
- Admin roasting history with edit/delete
- PostgreSQL persistence
- REST API between Angular and Spring Boot

The original POC explicitly describes the two-role split and admin dashboard/history design, while the implementation contains the batch calculations and stock adjustments. See the supplied POC files for the original behavior.

## Prerequisites
- Java 21
- Maven 3.9+
- Node.js 20+
- PostgreSQL 15+
- Angular CLI 20+

## PostgreSQL
Create database:

```sql
CREATE DATABASE roasting_monitor;
```

Update `backend/src/main/resources/application.properties` if your PostgreSQL username/password differ.

## Run backend

```bash
cd backend
mvn spring-boot:run
```

Backend: http://localhost:8080

## Run frontend

```bash
cd frontend
npm install
npm start
```

Frontend: http://localhost:4200

## Demo accounts
- operator / operator123
- admin / admin123

The original POC used these demo accounts client-side; in this version they are stored in PostgreSQL and passwords are BCrypt-hashed.

## API overview
- `POST /api/auth/login`
- `GET /api/materials`
- `POST /api/materials`
- `GET /api/batches?mine=true&username=operator`
- `GET /api/batches`
- `POST /api/batches`
- `PUT /api/batches/{id}`
- `DELETE /api/batches/{id}`

## Next production steps
1. Replace the simple `X-User` header/session approach with JWT or OAuth2.
2. Add proper role authorization at the Spring Security layer.
3. Add database migrations with Flyway.
4. Add Excel import/export endpoints using Apache POI.
5. Add automated unit/integration tests and audit logging.
"# roasting-monitor" 
