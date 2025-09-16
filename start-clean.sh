#!/bin/bash
set -e

echo "🛡️ Project Sentinel - Starting..."

# Function to kill process on port
kill_port() {
    local port=$1
    if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1; then
        echo "Killing process on port $port..."
        lsof -Pi :$port -sTCP:LISTEN -t | xargs kill -9 2>/dev/null || true
    fi
}

# Clean up any existing containers
echo "Cleaning up existing containers..."
docker-compose down -v 2>/dev/null || true
docker rm -f $(docker ps -aq) 2>/dev/null || true

# Kill processes on required ports
kill_port 3001
kill_port 8001
kill_port 5433
kill_port 6380

# Clean Docker system
docker system prune -f --volumes 2>/dev/null || true

# Build containers
echo "Building containers..."
docker-compose build --no-cache

# Start services
echo "Starting services..."
docker-compose up -d

# Wait for services
echo "Waiting for services to be ready..."
sleep 10

# Health check
if curl -f http://localhost:8001/health >/dev/null 2>&1; then
    echo "✅ Backend is healthy"
else
    echo "⚠️ Backend not responding yet"
fi

echo ""
echo "✅ Project Sentinel is running!"
echo "   Dashboard: http://localhost:3001"
echo "   API: http://localhost:8001"
echo ""
echo "View logs: docker-compose logs -f"
echo "Stop: docker-compose down"
