# Project Sentinel

AI-powered phishing email analyzer.

## Quick Start

```bash
# Clone repo
git clone https://github.com/your-org/project-sentinel.git
cd project_sentinel

# Add API keys (optional)
echo "OPENAI_API_KEY=sk-your-key" >> .env
echo "VIRUSTOTAL_API_KEY=your-key" >> .env

# Build and run
docker-compose up --build

# Open http://localhost:3000
```

## Architecture

- **Backend**: FastAPI on port 8000
- **Worker**: Celery for async processing
- **Frontend**: Next.js on port 3000
- **Database**: PostgreSQL
- **Queue**: Redis

## API Endpoints

- `POST /api/v1/reports` - Submit email
- `GET /api/v1/reports` - List reports
- `GET /api/v1/reports/{id}` - Get details

## GitHub Actions

CI/CD runs on push to main:
- Tests Python and Node.js code
- Builds Docker images
- Validates entire stack

## Local Development

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
