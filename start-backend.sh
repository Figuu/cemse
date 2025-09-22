#!/bin/bash

# =============================================================================
# CEMSE Backend Startup Script
# =============================================================================
# Ensures Docker backend services are running
# =============================================================================

set -e

# Configuration
APP_PATH="/opt/cemse"

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')] $1${NC}"
}

warn() {
    echo -e "${YELLOW}[$(date +'%Y-%m-%d %H:%M:%S')] WARNING: $1${NC}"
}

error() {
    echo -e "${RED}[$(date +'%Y-%m-%d %H:%M:%S')] ERROR: $1${NC}"
}

# Function to start backend services
start_backend() {
    log "🐳 Starting CEMSE backend services..."

    cd "$APP_PATH"

    # Check if Docker is running
    if ! systemctl is-active --quiet docker; then
        log "Starting Docker service..."
        sudo systemctl start docker
        sleep 5
    fi

    # Start backend containers
    docker-compose up -d

    # Wait for services to be ready
    sleep 10

    # Check status
    if docker-compose ps | grep -q "Up"; then
        log "✅ Backend services are running"
        docker-compose ps
    else
        error "❌ Some backend services failed to start"
        docker-compose ps
        exit 1
    fi
}

# Main function
main() {
    start_backend
}

# Run if called directly
if [ "${BASH_SOURCE[0]}" = "${0}" ]; then
    main "$@"
fi