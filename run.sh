#!/bin/bash
set -e

echo "🛡️ Project Sentinel Launcher"
echo "============================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}✓${NC} $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

# Check Docker
if ! command -v docker &> /dev/null; then
    print_error "Docker is not installed"
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    print_error "Docker Compose is not installed"
    exit 1
fi

# Check Make
if ! command -v make &> /dev/null; then
    print_warning "Make not found, using direct commands"
    
    # Direct cleanup
    echo "🧹 Cleaning up old containers..."
    docker ps -a | grep sentinel | awk '{print $1}' | xargs -r docker rm -f 2>/dev/null || true
    docker-compose down -v --remove-orphans 2>/dev/null || true
    docker network prune -f 2>/dev/null || true
    docker volume prune -f 2>/dev/null || true
    
    # Kill ports
    for port in 3000 8000 5432 6379; do
        if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1; then
            lsof -Pi :$port -sTCP:LISTEN -t | xargs kill -9 2>/dev/null || true
            print_status "Freed port $port"
        fi
    done
    
    # Build and run
    echo "🔨 Building containers..."
    PROJECT_NAME="sentinel-$(date +%s)"
    export PROJECT_NAME
    docker-compose -p $PROJECT_NAME build --no-cache
    
    echo "🚀 Starting services..."
    docker-compose -p $PROJECT_NAME up -d
    
    sleep 10
    
    # Check health
    if curl -s http://localhost:8000/health >/dev/null 2>&1; then
        print_status "Backend is healthy"
    else
        print_warning "Backend not ready yet"
    fi
    
    echo ""
    print_status "Project Sentinel is running!"
    echo "   Dashboard: http://localhost:3000"
    echo "   API: http://localhost:8000"
    echo ""
    echo "Stop with: docker-compose -p $PROJECT_NAME down"
else
    # Use Make
    print_status "Using Makefile"
    make restart
fi
