# Project Context: BaaS / SaaS Demo (SvelteKit)

## Overview
This project is a Backend-as-a-Service (BaaS) or SaaS starter application built with **SvelteKit**. It features a robust multi-tenancy architecture with Organizations, Groups, and a flexible Object/Class entity system. It uses **Drizzle ORM** for database management and **Better-Auth** for authentication.

## Tech Stack

*   **Framework:** SvelteKit (Svelte 5 with Runes)
*   **Language:** TypeScript
*   **Database:** PostgreSQL
*   **ORM:** Drizzle ORM (`drizzle-orm`, `drizzle-kit`)
*   **Authentication:** Better-Auth (`better-auth`)
*   **Styling:** Tailwind CSS v4 (`@tailwindcss/vite`)
*   **UI Components:** Bits UI (`bits-ui`), likely a custom implementation or Shadcn-Svelte port.
*   **Validation:** Valibot (`valibot`)
*   **Runtime:** Bun (inferred from `bun.lock`)

## Project Structure

### Key Directories
*   `drizzle/`: Contains the database schema definitions (`schema.ts`) and SQL migrations.
    *   **Schemas:** `auth` (Users, Sessions, Accounts) and `dbo` (Objects, Classes, Permissions, Organizations).
*   `src/lib/db/`: Database connection initialization (`index.ts`).
*   `src/lib/remotes/`: Abstraction layer for server-side actions and form handling (e.g., `createOrganization`, `deleteOrganization`).
*   `src/lib/server/`: Backend utilities, including Authentication helpers and PostgREST client wrappers (`postgrest/`).
*   `src/lib/components/ui/`: Reusable UI components (Buttons, Dialogs, etc.).
*   `src/routes/`: SvelteKit application routes.
    *   `(dashboard)/dashboard/`: Protected application area containing Organization and Group management.

## Architecture Highlights

### Data Model
The database is split into two main schemas:
1.  **`auth`**: Manages identities (Users, Sessions, Accounts, SSO).
2.  **`dbo`**: Manages business logic.
    *   **Objects & Classes:** A meta-model for defining entities (`objects`, `classes`, `entities`).
    *   **Multi-tenancy:** Built around `organizations` (which appear to be a type of Class/Object) and `groups`.
    *   **Permissions:** Fine-grained RBAC system (`permissions`, `permission_enum`).

### Backend Interaction
The application uses a "Remote" pattern (`src/lib/remotes`) to handle form submissions and data mutations. It likely interfaces with a PostgREST backend or similar API structure via `src/lib/server/postgrest`.

## Development

### Setup
1.  Install dependencies:
    ```bash
    npm install
    # or
    bun install
    ```

2.  Environment Variables:
    Ensure `.env` is configured with `DATABASE_URL` and other necessary keys (PostgREST URL, Auth secrets).

3.  Run Development Server:
    ```bash
    npm run dev
    ```

### Database Management
*   **Generate Migrations:** `npm run drizzle-kit generate`
*   **Push Schema:** `npm run drizzle-kit push` (or similar command configured in scripts)
*   **Studio:** `npm run drizzle-kit studio` (if available/installed)

### Code Quality
*   **Linting:** `npm run lint`
*   **Type Checking:** `npm run check`
