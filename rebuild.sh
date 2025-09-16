#!/bin/bash
set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}Project Sentinel - Complete Rebuild Script${NC}"
echo "============================================="

# Decide which docker-compose file to use
# - If USE_SIMPLE=1 is set, force simple compose (3001/8001)
# - Else, if port 3000 is free, prefer standard compose (3000/8000)
# - Otherwise, fall back to simple compose
if [[ "${USE_SIMPLE}" == "1" ]]; then
  COMPOSE_FILE="docker-compose.simple.yml"
else
  if lsof -Pi :3000 -sTCP:LISTEN -t >/dev/null 2>&1; then
    COMPOSE_FILE="docker-compose.simple.yml"
  else
    COMPOSE_FILE="docker-compose.yml"
  fi
fi

if [[ "${COMPOSE_FILE}" == "docker-compose.simple.yml" ]]; then
  FRONT_PORT=3001
  API_PORT=8001
  echo -e "Using compose file: ${YELLOW}${COMPOSE_FILE}${NC} (frontend:${FRONT_PORT}, api:${API_PORT})"
else
  FRONT_PORT=3000
  API_PORT=8000
  echo -e "Using compose file: ${YELLOW}${COMPOSE_FILE}${NC} (frontend:${FRONT_PORT}, api:${API_PORT})"
fi

# Preflight: ensure Docker daemon is running
if ! docker info >/dev/null 2>&1; then
  echo -e "\n${RED}Docker daemon is not running.${NC}"
  echo "Please start Docker Desktop and re-run this script: ./rebuild.sh"
  exit 1
fi

# Step 1: Kill processes on ports
echo -e "\n${YELLOW}Step 1: Killing processes on ports...${NC}"
for port in 3000 3001 8000 8001 5432 5433 6379 6380; do
    if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1; then
        echo "Killing process on port $port..."
        lsof -Pi :$port -sTCP:LISTEN -t | xargs kill -9 2>/dev/null || true
    fi
done

# Step 2: Clean all Docker resources
echo -e "\n${YELLOW}Step 2: Cleaning Docker resources...${NC}"
docker-compose -f "${COMPOSE_FILE}" down -v --remove-orphans 2>/dev/null || true
docker ps -aq | xargs docker rm -f 2>/dev/null || true
docker network prune -f 2>/dev/null || true
docker volume prune -f 2>/dev/null || true
docker system prune -af --volumes 2>/dev/null || true

# Step 2.5: Remove tagged images
echo -e "\n${YELLOW}Step 2.5: Removing tagged project images...${NC}"
docker images -q --filter=reference='*sentinel*' | xargs -r docker rmi -f 2>/dev/null || true

# Step 3: Fix frontend dependencies
echo -e "\n${YELLOW}Step 3: Fixing frontend dependencies...${NC}"
cd frontend
rm -rf node_modules package-lock.json .next
npm install
cd ..

# Step 4: Build containers
echo -e "\n${YELLOW}Step 4: Building containers...${NC}"
export COMPOSE_PROJECT_NAME=sentinel_$(date +%s)
docker-compose -f "${COMPOSE_FILE}" build --no-cache

# Step 5: Start services
echo -e "\n${YELLOW}Step 5: Starting services...${NC}"
docker-compose -f "${COMPOSE_FILE}" up -d

# Step 6: Wait for services
echo -e "\n${YELLOW}Step 6: Waiting for services to be ready...${NC}"
sleep 10

# Step 7: Check health
echo -e "\n${YELLOW}Step 7: Checking service health...${NC}"
if curl -f "http://localhost:${API_PORT}/health" >/dev/null 2>&1; then
    echo -e "${GREEN}✅ Backend is healthy${NC}"
else
    echo -e "${RED}❌ Backend not responding${NC}"
fi

if curl -f "http://localhost:${FRONT_PORT}" >/dev/null 2>&1; then
    echo -e "${GREEN}✅ Frontend is running${NC}"
else
    echo -e "${RED}❌ Frontend not responding${NC}"
fi

echo -e "\n${GREEN}=============================================${NC}"
echo -e "${GREEN}Project Sentinel is running!${NC}"
echo -e "${GREEN}Dashboard: http://localhost:${FRONT_PORT}${NC}"
echo -e "${GREEN}API: http://localhost:${API_PORT}${NC}"
echo -e "${GREEN}=============================================${NC}"
echo ""
echo "Commands:"
echo "  docker-compose -f ${COMPOSE_FILE} logs -f    # View logs"
echo "  docker-compose -f ${COMPOSE_FILE} down        # Stop services"
echo "  docker-compose -f ${COMPOSE_FILE} ps          # Check status"
