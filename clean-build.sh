#!/bin/bash
set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}═══════════════════════════════════════${NC}"
echo -e "${BLUE}    Project Sentinel - Clean Build     ${NC}"
echo -e "${BLUE}═══════════════════════════════════════${NC}"
echo ""

# Function to print status
status() {
    echo -e "${GREEN}✓${NC} $1"
}

error() {
    echo -e "${RED}✗${NC} $1"
    exit 1
}

warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

# Step 1: Complete cleanup
echo -e "${YELLOW}Step 1: Complete Cleanup${NC}"
echo "Removing all Docker containers and images..."

# Stop and remove all containers
docker stop $(docker ps -aq) 2>/dev/null || true
docker rm $(docker ps -aq) 2>/dev/null || true

# Remove project-specific images
docker images | grep sentinel | awk '{print $3}' | xargs -r docker rmi -f 2>/dev/null || true

# Clean up Docker system
docker system prune -af --volumes 2>/dev/null || true

# Clean networks
docker network prune -f 2>/dev/null || true

status "Docker cleanup complete"

# Step 2: Kill processes on ports
echo ""
echo -e "${YELLOW}Step 2: Freeing Ports${NC}"

for port in 3001 8001 5433 6380; do
    if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1; then
        lsof -Pi :$port -sTCP:LISTEN -t | xargs kill -9 2>/dev/null || true
        status "Freed port $port"
    fi
done

# Step 3: Generate unique project name
PROJECT_NAME="sentinel-$(date +%Y%m%d-%H%M%S)"
export PROJECT_NAME
echo ""
echo -e "${YELLOW}Step 3: Project Configuration${NC}"
status "Project name: $PROJECT_NAME"

# Step 4: Build containers
echo ""
echo -e "${YELLOW}Step 4: Building Containers${NC}"

docker-compose -p $PROJECT_NAME build --no-cache || error "Build failed"
status "All containers built successfully"

# Step 5: Start services
echo ""
echo -e "${YELLOW}Step 5: Starting Services${NC}"

docker-compose -p $PROJECT_NAME up -d || error "Failed to start services"

echo "Waiting for services to initialize..."
sleep 10

# Step 6: Health check
echo ""
echo -e "${YELLOW}Step 6: Health Check${NC}"

# Check backend
if curl -s http://localhost:8001/health >/dev/null 2>&1; then
    status "Backend API is healthy"
else
    warning "Backend API not responding yet (may still be starting)"
fi

# Check frontend
if curl -s http://localhost:3001 >/dev/null 2>&1; then
    status "Frontend is running"
else
    warning "Frontend not responding yet (may still be building)"
fi

# Step 7: Display status
echo ""
echo -e "${BLUE}═══════════════════════════════════════${NC}"
echo -e "${GREEN}    Project Sentinel is Running!      ${NC}"
echo -e "${BLUE}═══════════════════════════════════════${NC}"
echo ""
echo -e "${BLUE}Dashboard:${NC} http://localhost:3001"
echo -e "${BLUE}API:${NC} http://localhost:8001"
echo ""
echo -e "${YELLOW}Useful Commands:${NC}"
echo "  View logs:    docker-compose -p $PROJECT_NAME logs -f"
echo "  Stop:         docker-compose -p $PROJECT_NAME down"
echo "  Status:       docker-compose -p $PROJECT_NAME ps"
echo ""
echo -e "${GREEN}Project ID: $PROJECT_NAME${NC}"
echo "(Save this ID to manage this specific deployment)"
