# Architecture Decision Record (ADR)

## 1. Project Architecture
Project: Books Store
Status: Accepted

### Technology Stack
- React with TypeScript for building reusable UI components.
- Vite for development and production builds.
- React Router for client-side navigation.
- React Hook Form and Zod for form handling and validation.
- CSS variables for consistent design tokens.
- REST API for authentication, products, cart, and checkout.

### Decision: Component-Based Architecture
The application will be divided into reusable components, pages, shared UI elements, API services, and TypeScript types.

## 2. API Communication
All HTTP requests will be centralized in a shared API client rather than implemented separately in every component.
The API base URL will be configured using `VITE_API_URL`.

## 3. Authentication and Token Storage
The access token will be stored in `localStorage`.
The application will use the token in the `Authorization: Bearer <token>` header and validate the current session through the API.

## 4. Server State
Server-managed data, including products and the shopping cart, will be treated as data owned by the API.
The application will not use `localStorage` as the source of truth for the shopping cart.

## 5. Git Workflow
The `main` branch will contain stable, working versions of the project. Features will be developed incrementally, with descriptive commits.
Commit messages will use prefixes such as `feat`, `fix`, `style`, `docs`, and `chore`.

## 6. Environment Configuration
The API URL will be stored in `.env`, while `.env.example` will document the required variable.
