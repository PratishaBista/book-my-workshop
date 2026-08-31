# BookMyWorkshop

Workshop discovery, ticketing, and administration platform with integrated machine learning services.

## Architecture

The system consists of a centralized ASP.NET Core backend, a FastAPI machine learning service, and four discrete React client applications segmented by user role.

```**text**
[ Client-Public ]     [ Client-Host ]     [ Client-Admin ]     [ Client-SuperAdmin ]
  (Attendees)           (Providers)         (Moderators)         (Platform Owners)
       |                     |                   |                      |
       +----------+----------+---------+---------+----------------------+
                  |                    |
                  v                    v (Direct Host Enhancement)
       [ ASP.NET Core Web API ] <----> [ FastAPI ML Service ]
                  |                      - Sentiment Analysis (Reviews)
                  v                      - Text Enhancement (NLP)
           [ SQL Database ]              - Category Recommendation
           - EF Core Migrations
           - ASP.NET Identity (RBAC)
```

## System Components

### 1. Backend (`API/`)
- ASP.NET Core Web API serving as the central domain and persistence gateway.
- Authentication: JWT bearer tokens with role claims (`User`, `Provider`, `Admin`, `SuperAdmin`).
- Data access: Entity Framework Core with code-first migrations.
- Integrations: Stripe API and eSewa payment gateways, dynamic QR code generation for ticket validation.

### 2. Machine Learning Microservice (`Microservice/`)
- FastAPI Python service exposing specialized NLP endpoints.
- Endpoints:
  - `POST /api/v1/sentiment`: Inference on attendee review text.
  - `POST /api/v1/enhance`: NLP assistance for workshop titles and descriptions.
  - `POST /api/v1/recommendation`: Category classification based on workshop metadata.

### 3. Frontends (`Client-*/`)
Four independent single-page applications built on React 19, TypeScript, Vite, and TailwindCSS:
- `Client-Public`: Workshop discovery, map exploration (Leaflet), booking flow, checkout, and attendee ticket storage.
- `Client-Host`: Workshop lifecycle management, scheduling, venue quota tracking, integrated AI description enhancement, and in-venue QR ticket verification.
- `Client-Admin`: Content moderation, provider verification queues, and system reporting.
- `Client-SuperAdmin`: Platform financial metrics, audit logs, and accounting ledger.

## Technology Stack

```text
Backend:        C# / .NET, ASP.NET Core, Entity Framework Core
ML Service:     Python 3, FastAPI, Uvicorn, NLTK / Transformers
Frontend:       TypeScript, React 19, Vite, TailwindCSS, TanStack Query
Security:       ASP.NET Identity, JWT Bearer Authentication
Payments:       Stripe, eSewa
External APIs:  Leaflet (OpenStreetMap), QR Code Engine
```

## Directory Structure

```text
.
├── API/                 ASP.NET Core REST API
├── Client-Public/       Public attendee portal
├── Client-Host/         Host and organizer management portal
├── Client-Admin/        Platform moderation portal
├── Client-SuperAdmin/   Administrative operations and financial ledger
├── Microservice/        FastAPI Python ML service
└── Documentation/       Technical module specifications and API schemas
```

## Notice

Copyright (c) 2026 Pratisha Bista. All rights reserved.

No license is granted for commercial deployment without prior written permission.
