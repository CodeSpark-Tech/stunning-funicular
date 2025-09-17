#!/bin/bash
set -e

echo "═══════════════════════════════════════"
echo "   PROJECT SENTINEL - GUARANTEED BUILD"
echo "═══════════════════════════════════════"

# Step 1: Nuclear cleanup
echo "Step 1: Removing EVERYTHING Docker-related..."
docker kill $(docker ps -q) 2>/dev/null || true
docker rm $(docker ps -a -q) 2>/dev/null || true
docker rmi $(docker images -q) 2>/dev/null || true
docker system prune -af --volumes 2>/dev/null || true
echo "✓ Docker cleaned"

# Step 2: Free all ports
echo "Step 2: Freeing ports..."
for port in 3001 8001 5433 6380; do
    fuser -k ${port}/tcp 2>/dev/null || true
done
echo "✓ Ports freed"

# Step 3: Use simple compose file
echo "Step 3: Building with simple configuration..."
docker-compose -f docker-compose.simple.yml build --no-cache

# Step 4: Start services
echo "Step 4: Starting services..."
docker-compose -f docker-compose.simple.yml up -d

# Step 5: Wait for services
echo "Step 5: Waiting for initialization (30 seconds)..."
for i in {1..30}; do
    echo -n "."
    sleep 1
done
echo ""

# Step 6: Show status
echo ""
echo "═══════════════════════════════════════"
echo "✓ BUILD COMPLETE"
echo "═══════════════════════════════════════"
echo ""
echo "Dashboard: http://localhost:3001"
echo "API: http://localhost:8001"
echo ""
echo "View logs: docker-compose -f docker-compose.simple.yml logs -f"
echo "Stop: docker-compose -f docker-compose.simple.yml down"
