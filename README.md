# 🏥 Hospital Management System

A production-ready, microservices-based Hospital Management System built with enterprise-grade technologies.

## 🏗️ Architecture

- **10 Microservices** — API Gateway, Discovery, Auth, Patient, Doctor, Appointment, Prescription, Billing, Notification, Audit
- **Database per Service** — Each service owns its MySQL schema
- **Event-Driven** — RabbitMQ for async communication between services
- **Service Discovery** — Netflix Eureka for dynamic service registration
- **API Gateway** — Spring Cloud Gateway with JWT validation, rate limiting, circuit breaking

## 🛠️ Tech Stack

### Backend
| Technology | Version | Purpose |
|---|---|---|
| Java | 21 | Language |
| Spring Boot | 3.3.x | Framework |
| Spring Cloud | 2024.0.x | Microservices |
| Spring Security + JWT | - | Authentication |
| Spring Data JPA | - | Data Access |
| Flyway | 10.x | DB Migrations |
| MySQL | 8.0 | Database |
| Redis | 7.x | Caching & Rate Limiting |
| RabbitMQ | 3.x | Message Broker |

### Frontend
| Technology | Version | Purpose |
|---|---|---|
| React | 19 | UI Framework |
| TypeScript | 5.x | Language |
| Vite | 6.x | Build Tool |
| Material UI | 6.x | Component Library |
| TanStack Query | 5.x | Data Fetching |
| Zustand | 5.x | State Management |
| React Hook Form + Zod | - | Form Validation |
| Recharts | 2.x | Charts |

### Infrastructure
| Technology | Purpose |
|---|---|
| Docker + Docker Compose | Containerization |
| GitHub Actions | CI/CD |
| AWS ECS Fargate | Cloud Deployment |
| Prometheus + Grafana | Monitoring |
| ELK Stack | Logging |

## 🚀 Quick Start

### Prerequisites
- Java 21
- Node.js 22+
- Docker & Docker Compose
- Maven 3.9+

### Run with Docker Compose
```bash
# Clone the repository
git clone https://github.com/your-org/hospital-management-system.git
cd hospital-management-system

# Start all services
docker compose up -d

# Wait for services to be healthy
docker compose ps
```

### Access Points
| Service | URL |
|---|---|
| Frontend | http://localhost:3000 |
| API Gateway | http://localhost:8080 |
| Eureka Dashboard | http://localhost:8761 (eureka/eureka_secret) |
| Swagger UI | http://localhost:8080/swagger-ui.html |
| RabbitMQ Dashboard | http://localhost:15672 (hospital/hospital_pass) |
| Prometheus | http://localhost:9090 |
| Grafana | http://localhost:3001 (admin/admin) |
| Kibana | http://localhost:5601 |

### Default Admin Credentials
```
Username: admin
Password: Admin@123
```

### Run Backend Locally (without Docker)
```bash
cd backend

# Build all modules
mvn clean install -DskipTests

# Start Discovery Service first
cd discovery-service && mvn spring-boot:run &

# Start API Gateway
cd ../api-gateway && mvn spring-boot:run &

# Start Auth Service
cd ../auth-service && mvn spring-boot:run &

# Start other services...
```

### Run Frontend Locally
```bash
cd frontend
npm install
npm run dev
```

## 📁 Project Structure

```
hospital-management-system/
├── backend/
│   ├── common-lib/          # Shared DTOs, events, exceptions
│   ├── discovery-service/   # Eureka Server (port 8761)
│   ├── api-gateway/         # Spring Cloud Gateway (port 8080)
│   ├── auth-service/        # Authentication & Users (port 8081)
│   ├── patient-service/     # Patient Management (port 8082)
│   ├── doctor-service/      # Doctor Management (port 8083)
│   ├── appointment-service/ # Appointments (port 8084)
│   ├── prescription-service/# Prescriptions (port 8085)
│   ├── billing-service/     # Billing & Payments (port 8086)
│   ├── notification-service/# Email/SMS Notifications (port 8087)
│   └── audit-service/       # Audit Trail & HIPAA (port 8088)
├── frontend/                # React 19 + TypeScript
├── infrastructure/          # Docker, K8s, Prometheus, ELK
├── .github/workflows/       # CI/CD Pipelines
└── docker-compose.yml
```

## 🔐 Roles & Permissions

| Role | Access |
|---|---|
| ADMIN | Full system access, user management, reports |
| DOCTOR | Dashboard, patients, appointments, prescriptions |
| RECEPTIONIST | Patient registration, appointment management |
| PHARMACIST | Prescription access, medication management |
| BILLING_STAFF | Invoice management, payment tracking |
| PATIENT | Portal, book appointments, view prescriptions |

## 🧪 Testing

```bash
# Backend unit + integration tests
cd backend && mvn clean verify

# Frontend tests
cd frontend && npm run test

# E2E tests
cd frontend && npm run test:e2e
```

## 📋 API Documentation

Swagger UI is available at `http://localhost:8080/swagger-ui.html` when the gateway is running. It aggregates documentation from all services.

## 📝 License

This project is licensed under the MIT License.
