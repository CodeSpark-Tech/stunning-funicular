#!/bin/bash
set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}Project Sentinel - Complete Rebuild Script${NC}"
echo "============================================="

# Step 1: Kill processes on ports
echo -e "\n${YELLOW}Step 1: Killing processes on ports...${NC}"
for port in 3001 8001 5433 6380; do
    if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1; then
        echo "Killing process on port $port..."
        lsof -Pi :$port -sTCP:LISTEN -t | xargs kill -9 2>/dev/null || true
    fi
done

# Step 2: Clean all Docker resources
echo -e "\n${YELLOW}Step 2: Cleaning Docker resources...${NC}"
docker-compose down -v --remove-orphans 2>/dev/null || true
docker ps -aq | xargs docker rm -f 2>/dev/null || true
docker network prune -f 2>/dev/null || true
docker volume prune -f 2>/dev/null || true
docker system prune -af --volumes 2>/dev/null || true

# Step 3: Fix frontend dependencies
echo -e "\n${YELLOW}Step 3: Fixing frontend dependencies...${NC}"
cd frontend
rm -rf node_modules package-lock.json .next
npm install
cd ..

# Step 4: Build containers
echo -e "\n${YELLOW}Step 4: Building containers...${NC}"
export COMPOSE_PROJECT_NAME=sentinel_$(date +%s)
docker-compose build --no-cache

# Step 5: Start services
echo -e "\n${YELLOW}Step 5: Starting services...${NC}"
docker-compose up -d

# Step 6: Wait for services
echo -e "\n${YELLOW}Step 6: Waiting for services to be ready...${NC}"
sleep 10

# Step 7: Check health
echo -e "\n${YELLOW}Step 7: Checking service health...${NC}"
if curl -f http://localhost:8001/health >/dev/null 2>&1; then
    echo -e "${GREEN}✅ Backend is healthy${NC}"
else
    echo -e "${RED}❌ Backend not responding${NC}"
fi

if curl -f http://localhost:3001 >/dev/null 2>&1; then
    echo -e "${GREEN}✅ Frontend is running${NC}"
else
    echo -e "${RED}❌ Frontend not responding${NC}"
fi

echo -e "\n${GREEN}=============================================${NC}"
echo -e "${GREEN}Project Sentinel is running!${NC}"
echo -e "${GREEN}Dashboard: http://localhost:3001${NC}"
echo -e "${GREEN}API: http://localhost:8001${NC}"
echo -e "${GREEN}=============================================${NC}"
echo ""
echo "Commands:"
echo "  docker-compose logs -f    # View logs"
echo "  docker-compose down        # Stop services"
echo "  docker-compose ps          # Check status"
