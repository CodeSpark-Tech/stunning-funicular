#!/bin/bash
set -e

echo "╔══════════════════════════════════════════════════════════╗"
echo "║     PROJECT SENTINEL - COMPLETE SETUP & INITIALIZATION    ║"
echo "╚══════════════════════════════════════════════════════════╝"
echo ""

# Color codes
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Function to print colored messages
print_status() {
    echo -e "${GREEN}[✓]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[!]${NC} $1"
}

print_error() {
    echo -e "${RED}[✗]${NC} $1"
}

# Function to kill process on port
kill_port() {
    local port=$1
    if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1; then
        print_warning "Killing process on port $port..."
        lsof -Pi :$port -sTCP:LISTEN -t | xargs kill -9 2>/dev/null || true
    fi
}

# Check Docker
print_status "Checking Docker installation..."
if ! command -v docker &> /dev/null; then
    print_error "Docker is not installed. Please install Docker first."
    echo "Visit: https://docs.docker.com/get-docker/"
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    print_error "Docker Compose is not installed. Please install Docker Compose first."
    echo "Visit: https://docs.docker.com/compose/install/"
    exit 1
fi

print_status "Docker and Docker Compose are installed"

# Clean existing setup
print_status "Cleaning existing containers and volumes..."
docker-compose down -v 2>/dev/null || true
docker rm -f $(docker ps -aq) 2>/dev/null || true
docker system prune -f --volumes 2>/dev/null || true

# Kill processes on required ports
print_status "Freeing up required ports..."
kill_port 3001
kill_port 8001
kill_port 5433
kill_port 6380

# Create .env file if not exists
if [ ! -f .env ]; then
    print_status "Creating environment configuration..."
    cat > .env << EOF
# Optional API Keys (leave empty for demo mode)
OPENAI_API_KEY=
VIRUSTOTAL_API_KEY=

# Port Configuration
FRONTEND_PORT=3001
API_PORT=8001
DB_PORT=5433
REDIS_PORT=6380
EOF
    print_status "Environment file created (.env)"
fi

# Build containers
print_status "Building Docker containers..."
docker-compose build --no-cache

# Start services
print_status "Starting services..."
docker-compose up -d

# Wait for services to be ready
print_status "Waiting for services to initialize..."
echo -n "  PostgreSQL: "
for i in {1..30}; do
    if docker-compose exec -T postgres-db pg_isready -U sentinel >/dev/null 2>&1; then
        echo "Ready ✓"
        break
    fi
    echo -n "."
    sleep 1
done

echo -n "  Redis: "
for i in {1..10}; do
    if docker-compose exec -T redis-broker redis-cli ping >/dev/null 2>&1; then
        echo "Ready ✓"
        break
    fi
    echo -n "."
    sleep 1
done

echo -n "  Backend API: "
for i in {1..30}; do
    if curl -f http://localhost:8001/health >/dev/null 2>&1; then
        echo "Ready ✓"
        break
    fi
    echo -n "."
    sleep 1
done

echo -n "  Frontend: "
for i in {1..30}; do
    if curl -f http://localhost:3001 >/dev/null 2>&1; then
        echo "Ready ✓"
        break
    fi
    echo -n "."
    sleep 1
done

# Initialize sample data (backend does this automatically)
print_status "Sample data has been initialized automatically"

# Show logs for debugging if needed
if [ "$1" = "--logs" ]; then
    print_status "Showing service logs..."
    docker-compose logs -f
else
    # Success message
    echo ""
    echo "╔══════════════════════════════════════════════════════════╗"
    echo "║                  🎉 SETUP COMPLETE! 🎉                    ║"
    echo "╚══════════════════════════════════════════════════════════╝"
    echo ""
    echo "  📊 Dashboard:     http://localhost:3001"
    echo "  🔧 API Docs:      http://localhost:8001/docs"
    echo "  🗄️  Database:     localhost:5433 (user: sentinel, pass: sentinel123)"
    echo ""
    echo "  ℹ️  First-time users will see an onboarding tutorial"
    echo "  ✨ 3 sample campaigns have been created"
    echo "  👥 50 sample users with risk scores have been added"
    echo ""
    echo "  📝 Quick Actions:"
    echo "     • View logs:        docker-compose logs -f"
    echo "     • Stop services:    docker-compose down"
    echo "     • Reset everything: ./setup.sh"
    echo ""
    echo "  🚀 Open http://localhost:3001 to get started!"
    echo ""
fi
