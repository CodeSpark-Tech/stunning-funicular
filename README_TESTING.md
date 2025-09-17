# Project Sentinel - Complete Test Suite

AI-powered phishing email analyzer with comprehensive testing.

## Quick Start

```bash
tar -xzf project_sentinel_final_fixed.tar.gz
cd project_sentinel
./start.sh
```

Access at http://localhost:3001

## Testing Guide

### Prerequisites

```bash
# Backend test dependencies
cd backend
pip install -r test_requirements.txt

# Frontend test dependencies  
cd ../frontend
npm install --save-dev @testing-library/react @testing-library/jest-dom jest msw

# E2E test dependencies
cd ../e2e
npm install
npx playwright install
```

### Backend Tests (Python/Pytest)

```bash
cd backend

# Run all tests
pytest

# Run with coverage
pytest --cov=. --cov-report=html

# Run specific test categories
pytest tests/test_unit.py        # Unit tests only
pytest tests/test_integration.py # Integration tests only
pytest tests/test_worker.py      # Worker tests only

# Run with verbose output
pytest -v
```

Test files:
- `tests/test_unit.py` - URL extraction, JSON parsing
- `tests/test_integration.py` - API endpoint tests
- `tests/test_worker.py` - Celery task tests

### Frontend Tests (Jest/React Testing Library)

```bash
cd frontend

# Run all tests
npm test

# Run with coverage
npm run test:coverage

# Run in watch mode
npm run test:watch
```

Test files:
- `__tests__/dashboard.test.js` - Component and integration tests

### End-to-End Tests (Playwright)

```bash
# Start the application first
docker-compose up -d

# Run E2E tests
cd e2e
npm test

# Run with headed browser (see tests running)
npm run test:headed

# Debug mode
npm run test:debug

# View test report
npm run report
```

Test scenarios:
- Full report lifecycle (submit → process → complete)
- Statistics updates
- Auto-refresh functionality
- API health checks

### CI/CD Testing

Tests run automatically on GitHub Actions:

```yaml
# Triggered on:
- Push to main/develop branches
- Pull requests to main

# Test stages:
1. Backend tests (with test database)
2. Frontend tests (with mocked APIs)
3. E2E tests (full stack)
4. Integration build test
```

View test results in GitHub Actions tab.

### Running All Tests Locally

```bash
# Quick test all components
make test-all

# Or manually:
cd backend && pytest
cd ../frontend && npm test
docker-compose up -d && cd ../e2e && npm test
```

### Test Coverage Reports

- Backend: `backend/htmlcov/index.html`
- Frontend: `frontend/coverage/lcov-report/index.html`
- E2E: `e2e/playwright-report/index.html`

### Mocking External Services

Tests mock external APIs to avoid dependencies:
- OpenAI API → Returns predefined verdict
- VirusTotal API → Returns mock threat scores
- Frontend API calls → MSW intercepts

### Test Database

Integration tests use SQLite in-memory database.
No PostgreSQL required for unit tests.

### Troubleshooting Tests

```bash
# Clear test cache
pytest --cache-clear

# Reset Docker for E2E
docker-compose down -v
docker-compose up --build

# Update test snapshots (Jest)
npm test -- -u

# Install missing Playwright browsers
npx playwright install
```

## Makefile Commands

```bash
make test-backend    # Run backend tests
make test-frontend   # Run frontend tests  
make test-e2e       # Run E2E tests
make test-all       # Run all tests
make coverage       # Generate coverage reports
```

## Architecture

- Backend: FastAPI (port 8001)
- Worker: Celery
- Frontend: Next.js (port 3001)
- Database: PostgreSQL
- Queue: Redis

## Development

```bash
# Backend
cd backend
pip install -r requirements.txt
uvicorn main:app --reload

# Worker
cd worker
celery -A worker worker --loglevel=info

# Frontend
cd frontend
npm install
npm run dev
```

## License

MIT