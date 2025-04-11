# AI Agent Microservice Makefile

.PHONY: install build dev start stop restart logs clean docker-build docker-start docker-stop docker-logs

# Variables
NODE_ENV ?= development
DOCKER_COMPOSE = docker-compose

# Node.js commands
install:
	npm install

build:
	npm run build

dev:
	npm run dev

start:
	npm run build
	npm start

test:
	npm test

	# Comandos de formateo y linting
format:
	npm run format

format-check:
	npm run format:check

lint:
	npm run lint

lint-fix:
	npm run lint:fix

# Docker commands
docker-build:
	$(DOCKER_COMPOSE) build

docker-start:
	$(DOCKER_COMPOSE) up -d

docker-stop:
	$(DOCKER_COMPOSE) down

docker-restart:
	$(DOCKER_COMPOSE) restart

docker-logs:
	$(DOCKER_COMPOSE) logs -f

# Combined commands
up: install build docker-start

down: docker-stop

restart: docker-stop docker-start

logs: docker-logs

# Clean
clean:
	rm -rf node_modules
	rm -rf dist
	rm -rf logs/*.log

# Initialize environment
init:
	@if [ ! -f .env ]; then \
		cp .env.example .env; \
		echo "Created .env file from .env.example. Please update with your API keys."; \
	fi

# Generate key
generate-key:
	@node -e "console.log('SERVICE_API_KEY=' + require('crypto').randomBytes(32).toString('hex'))"

# Help
help:
	@echo "Available commands:"
	@echo "  make install       - Install dependencies"
	@echo "  make build         - Build the TypeScript project"
	@echo "  make dev           - Run in development mode with auto-reload"
	@echo "  make start         - Build and start the Node.js service"
	@echo "  make docker-build  - Build Docker images"
	@echo "  make docker-start  - Start services with Docker Compose"
	@echo "  make docker-stop   - Stop Docker Compose services"
	@echo "  make up            - Install, build and start with Docker"
	@echo "  make down          - Stop all services"
	@echo "  make logs          - View Docker logs"
	@echo "  make clean         - Remove build artifacts and dependencies"
	@echo "  make init          - Create initial .env file"
	@echo "  make generate-key  - Generate a random API key"
	@echo "  make format        - Format code with Prettier"
	@echo "  make format-check  - Check code formatting"
	@echo "  make lint          - Run ESLint"
	@echo "  make lint-fix      - Run ESLint and fix issues"

