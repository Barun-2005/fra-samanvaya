# FRA-Samanvaya Blueprint

## Overview

This document outlines the development plan for the `fra-samanvaya` project, a web application for managing land claims. The project consists of a Next.js frontend, a Node.js/Express backend, and integrates with several microservices.

## Current Plan: Phase 1 Scaffolding

The goal of Phase 1 is to establish the foundational structure of the application, including the repository layout, core backend services, and a basic Next.js frontend.

### Key Objectives:

1.  **Repository Setup:** Create a monorepo structure with separate `frontend` and `backend` directories.
2.  **Backend Initialization:** Set up an Express.js server with routes for authentication, claims, documents, and assets.
3.  **Database Integration:** Configure Mongoose to connect to a MongoDB database.
4.  **Authentication:** Implement JWT-based authentication with support for TOTP 2FA.
5.  **Frontend Initialization:** Create a Next.js application with Tailwind CSS for styling.
6.  **Containerization:** Dockerize the frontend and backend services for local development.
7.  **Seeding:** Create scripts to seed the database with initial data.

### Actionable Steps:

- [x] Create the project directory structure.
- [ ] Initialize `blueprint.md`.
- [ ] Create `.env.example`.
- [ ] Initialize the backend Express application.
- [ ] Install backend dependencies.
- [ ] Initialize the frontend Next.js application.
- [ ] Install frontend dependencies.
- [ ] Create Dockerfiles for frontend and backend.
- [ ] Create `docker-compose.yml`.
- [ ] Implement Mongoose schemas.
- [ ] Implement backend authentication routes.
- [ ] Implement backend API routes for claims, documents, and assets.
- [ ] Create reusable frontend components.
- [ ] Convert Stitch HTML to Next.js pages.
- [ ] Implement frontend API client and authentication handling.
- [ ] Implement map functionality with `react-leaflet`.
- [ ] Create seed scripts for the database.
- [ ] Write a `README.md` with setup and run instructions.
- [ ] Initialize a Git repository and make the first commit.
