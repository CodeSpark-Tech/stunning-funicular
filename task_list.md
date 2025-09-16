# Task List: Project Sentinel

## Phase 1: Foundation & Backend Setup

1.  **Initialize Monorepo:** Create the root directory with sub-folders: `/frontend`, `/backend`, `/worker`.
2.  **Define Docker Orchestration:** Create the root `docker-compose.yml` file defining all five services (frontend, backend, worker, postgres, redis).
3.  **Develop Backend API (FastAPI):**
    * Set up the FastAPI application.
    * Define the SQLAlchemy models for `Users`, `Campaigns`, and `Reports`.
    * Implement the core API endpoints for creating, reading, and updating campaigns and users.
4.  **Develop AI Worker (Celery):**
    * Configure the Celery worker to connect to the Redis broker.
    * Create the primary task for running a campaign, including placeholders for AI content generation and email sending.

## Phase 2: Frontend UI & User Experience

5.  **Initialize Frontend (Next.js):** Set up the Next.js application with TypeScript, Tailwind CSS, and Shadcn/ui.
6.  **Build the Main UI Shell:** Create the main layout, including the icon-only navigation rail and the header with the system status indicator.
7.  **Implement the Guided Setup Wizard:** Build the multi-step modal for the first-run configuration. This is a top priority.
8.  **Develop the Dashboard View:** Create the main dashboard page with placeholder stat cards and a campaign list view.
9.  **Build the Campaign Creation Modal:** Implement the "Create Campaign" floating window, including the multi-step wizard for setup, email selection, and scheduling (with recurring options).
10. **Connect Frontend to Backend:** Wire up the frontend UI to the backend API endpoints to fetch and submit data.

## Phase 3: Final Integration & Polish

11. **Implement AI Logic:** In the worker, integrate the OpenAI API calls to dynamically generate email content based on campaign settings.
12. **Implement Reporting:** Build the reporting modals with charts (Recharts) to visualize campaign results.
13. **Create the Automated Setup Script:** Write the final `setup.sh` script to automate the entire build and launch process for a novice user.
14. **Documentation:** Write the final `README.md` explaining the project and how to use the setup script.
