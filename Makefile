# Project Sentinel Makefile
SHELL := /bin/bash
PROJECT_NAME := sentinel-$(shell date +%s)
COMPOSE := docker-compose -p $(PROJECT_NAME)

.PHONY: help
help:
	@echo "Project Sentinel Build System"
	@echo "=============================="
	@echo "make clean-all  - Complete cleanup (containers, volumes, networks)"
	@echo "make build      - Build from scratch"
	@echo "make up         - Start services"
	@echo "make down       - Stop services"
	@echo "make restart    - Full restart (clean + build + up)"
	@echo "make logs       - View logs"
	@echo "make status     - Check service status"

.PHONY: clean-all
clean-all:
	@echo "🧹 Complete cleanup..."
	# Stop all sentinel containers
	-docker ps -a | grep sentinel | awk '{print $$1}' | xargs -r docker rm -f 2>/dev/null
	# Remove all sentinel images
	-docker images | grep sentinel | awk '{print $$3}' | xargs -r docker rmi -f 2>/dev/null
	# Clean all compose projects
	-docker-compose down -v --remove-orphans 2>/dev/null
	# Remove specific containers by name
	-docker rm -f sentinel_postgres sentinel_redis sentinel_backend sentinel_worker sentinel_frontend 2>/dev/null
	# Clean networks
	-docker network prune -f 2>/dev/null
	# Clean volumes
	-docker volume prune -f 2>/dev/null
	# Kill processes on our ports
	-lsof -ti:3001 | xargs -r kill -9 2>/dev/null
	-lsof -ti:8001 | xargs -r kill -9 2>/dev/null
	-lsof -ti:5433 | xargs -r kill -9 2>/dev/null
	-lsof -ti:6380 | xargs -r kill -9 2>/dev/null
	@echo "✅ Cleanup complete"

.PHONY: build
build: clean-all
	@echo "🔨 Building containers..."
	$(COMPOSE) build --no-cache

.PHONY: up
up:
	@echo "🚀 Starting services..."
	$(COMPOSE) up -d
	@sleep 5
	@make status

.PHONY: down
down:
	@echo "🛑 Stopping services..."
	$(COMPOSE) down -v

.PHONY: restart
restart: clean-all build up
	@echo "✅ Project Sentinel is running!"
	@echo "   Dashboard: http://localhost:3001"
	@echo "   API: http://localhost:8001"

.PHONY: logs
logs:
	$(COMPOSE) logs -f

.PHONY: status
status:
	@echo "📊 Service Status:"
	@echo -n "Backend: "
	@curl -s http://localhost:8001/health >/dev/null 2>&1 && echo "✅ Healthy" || echo "❌ Offline"
	@echo -n "Frontend: "
	@curl -s http://localhost:3001 >/dev/null 2>&1 && echo "✅ Running" || echo "❌ Not responding"
	@docker ps --filter "name=sentinel"
