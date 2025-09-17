# Project Sentinel - AI Phishing Analyzer with SPA Dashboard

## Quick Start (Recommended)

```bash
# Extract and run
tar -xzf project_sentinel_spa.tar.gz
cd project_sentinel

# Make scripts executable
chmod +x run.sh

# Start everything
./run.sh
```

Access at:
- **Dashboard**: http://localhost:3001 (Single Page Application)
- **API**: http://localhost:8001

## Alternative: Using Make

```bash
# Complete restart (cleans everything first)
make restart

# Or step by step:
make clean-all  # Remove ALL containers/volumes/networks
make build      # Build from scratch
make up         # Start services
make status     # Check health
```

## If You Get Port Conflicts

The most common issue is port conflicts. Here's how to fix:

```bash
# Option 1: Use the run script (handles everything)
./run.sh

# Option 2: Manual cleanup
# Kill processes on our ports
lsof -ti:3001 | xargs kill -9
lsof -ti:8001 | xargs kill -9
lsof -ti:5433 | xargs kill -9
lsof -ti:6380 | xargs kill -9

# Remove ALL Docker containers
docker stop $(docker ps -aq)
docker rm $(docker ps -aq)
docker system prune -af --volumes

# Now start fresh
docker-compose up --build
```

## Features

### Single Page Application (SPA)
- **No page reloads** - Everything happens in modals
- **Icon navigation** - Clean sidebar with tooltips
- **Real-time updates** - Auto-refresh every 10 seconds
- **Service monitoring** - Live health status indicator

### Modal Workflows
- **Create Campaign** - Multi-step wizard with scheduling
- **View Reports** - Interactive charts and user details
- **Toast Notifications** - Non-intrusive feedback

### Phishing Campaign Management
- Create and schedule phishing tests
- AI-powered email generation (Easy/Medium/Hard)
- Recurring schedule options
- Detailed analytics and reporting

## Architecture

```
Frontend (Next.js 14 + TypeScript + Tailwind)
    ↓
Backend API (FastAPI)
    ↓
Worker (Celery) → OpenAI/VirusTotal
    ↓
Database (PostgreSQL) + Queue (Redis)
```

## Ports Used

- `3001` - Frontend Dashboard
- `8001` - Backend API  
- `5433` - PostgreSQL
- `6380` - Redis

## Environment Variables

Optional API keys in `.env`:
```
OPENAI_API_KEY=sk-your-key
VIRUSTOTAL_API_KEY=your-key
```

## Development

```bash
# Backend development
make dev-backend

# Frontend development  
make dev-frontend

# Worker development
make dev-worker
```

## Testing

```bash
# Run all tests
make test

# Check service status
make status

# View logs
make logs
```

## Troubleshooting

### "Port already allocated" Error
This means Docker didn't clean up properly. Solution:
```bash
make clean-all
make restart
```

### Services Not Starting
Check logs:
```bash
make logs
# or
docker-compose logs backend
```

### Database Connection Issues
The database needs time to initialize:
```bash
make down
make up
# Wait 10 seconds for initialization
make status
```

## CI/CD

GitHub Actions workflow included for:
- Automated testing
- Docker image building
- Health checks
- Deployment to container registry

## Stack

- **Frontend**: Next.js 14, TypeScript, Tailwind CSS, Shadcn/ui, Zustand, Recharts, Framer Motion
- **Backend**: FastAPI, SQLAlchemy, Pydantic
- **Worker**: Celery, Redis
- **Database**: PostgreSQL 15
- **Containerization**: Docker & Docker Compose

## License

MIT
