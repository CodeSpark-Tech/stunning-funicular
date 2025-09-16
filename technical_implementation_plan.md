# Technical Implementation Plan: Project Sentinel

## 1. System Architecture

The project will be built as a **containerized monorepo** for easy management and deployment. A root `docker-compose.yml` file will orchestrate all services.

* **Monorepo Structure:** A single Git repository containing `/frontend`, `/backend`, and `/worker` directories.
* **Services:**
    1.  **Frontend:** A Next.js SPA providing the entire user interface.
    2.  **Backend API:** A FastAPI server handling all business logic, data, and user management.
    3.  **AI Worker:** A background Celery worker for processing heavy tasks like sending emails and analyzing data.
    4.  **Database:** A PostgreSQL instance for persistent data storage.
    5.  **Message Broker:** A Redis instance to queue tasks for the Celery worker.
* **Automated Setup:** A `setup.sh` script will automate the entire Docker build and launch process.

## 2. Technology Stack

* **Frontend:**
    * Framework: **Next.js 14+** (App Router)
    * Language: **TypeScript**
    * Styling: **Tailwind CSS**
    * UI Components: **Shadcn/ui** (for the slick, minimal aesthetic)
    * State Management: **Zustand**
    * Charts: **Recharts**
    * Notifications: **React Hot Toast**

* **Backend:**
    * Framework: **FastAPI (Python 3.11+)**
    * Database ORM: **SQLAlchemy 2.0** (async)
    * Validation: **Pydantic V2**

* **AI Worker:**
    * Task Queue: **Celery**
    * AI Integration: **OpenAI API** (or similar LLM) for content generation.
    * Threat Intel: **VirusTotal API** for URL scanning.

## 3. Core Component Design

* **Frontend UI/UX:**
    * **Guided First-Run Wizard:** A critical modal wizard to configure the system (admin account, API keys, SMTP) on first launch.
    * **Icon-Only Navigation:** A slim, futuristic vertical navigation rail.
    * **Modal-Driven SPA:** All forms and detailed views (creating campaigns, viewing reports) will open in modal windows, preventing page reloads.
    * **Real-Time Status:** The UI header will display the live connection status to the backend API.

* **Backend API:**
    * Provides secure RESTful endpoints for all frontend operations (CRUD for campaigns, users, etc.).
    * Handles user authentication and manages system configurations from the setup wizard.
    * When a campaign is created, it dispatches a task to the Celery worker via Redis.

* **AI Worker:**
    * Listens for tasks from the backend.
    * Executes long-running jobs: generates personalized email content with the LLM, schedules and sends the emails, and processes the results.
