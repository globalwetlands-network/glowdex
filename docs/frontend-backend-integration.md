# Frontend-Backend Integration

This document outlines the architecture, routing constraints, and future security implementation for the integration between the GLOWdex frontend and the AI backend service.

## Architecture Overview

The system consists of two primary applications:
1. **Frontend (GLOWdex App)**: A React application built with Vite, responsible for the user interface, state management, and maps feature.
2. **Backend (GLOWdex API)**: A NestJS application that securely handles API requests, external service integrations, and data processing.

The frontend communicates with the backend exclusively via `/api` route paths (e.g., `/api/ai/insight`).

## Local Development Setup

During local development, the two services run on separate ports:
- **Frontend Server**: `http://localhost:5173`
- **Backend Server**: `http://localhost:8080`

To circumvent CORS issues and simulate a production-like same-origin environment, the Vite development server is configured to **proxy all requests** starting with `/api` to the local backend.
When the frontend makes a fetch request to `/api/ai/insight`, Vite intercepts this and internally routes it to `http://localhost:8080/api/ai/insight`.

## Production Deployment Architecture

In a production environment, both the built frontend static assets and the NestJS backend run behind a **Reverse Proxy** (such as Nginx, AWS ALB, or another cloud load balancer).

- The reverse proxy exposes a single domain (e.g., `https://glowdex.example.org`).
- Requests to the root `/` or static asset paths are routed to the frontend server/CDN.
- Requests matching the `/api/*` path pattern are routed directly to the NestJS backend service.

This architecture ensures the frontend can safely use relative paths (`/api/...`) regardless of the environment.

## Authentication Strategy (Future)

Currently, the MVP handles unauthenticated API requests. Authentication will be implemented in the near future.
- **Implementation Mechanism:** Authentication will be enforced purely as a **Backend Middleware/Guard** within NestJS.
- **Frontend Implications:** The frontend will eventually need to read an auth token (e.g., from an environment variable or cookie) and append it to the `Authorization` header of `fetch` requests.

## Rate Limiting (Future)

To protect the backend from abuse (such as script spamming the AI interface):
- Currently, temporary rate protection is implemented on the frontend by keeping the chat submit button disabled while a request is actively pending.
- Robust rate limiting is planned for the future and will likely utilize the **NestJS Throttler** package on the backend to enforce strict, IP-based or token-based request quotas.
