#!/bin/bash
set -e

echo "Testing Project Sentinel Build..."

# Build all containers
echo "Building containers..."
docker-compose build

echo "✅ Build successful!"
echo ""
echo "To run the application:"
echo "  docker-compose up"
echo ""
echo "Then open http://localhost:3000"
