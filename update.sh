#!/bin/bash

# =============================================================================
# CEMSE Simple Update Script
# =============================================================================
# This script handles all update steps in one command:
# - git pull
# - prisma migrate & generate
# - restart docker backend
# - restart cemse service
# =============================================================================

set -e  # Exit on any error

# Configuration
APP_NAME="cemse"
APP_PATH="/opt/$APP_NAME"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging functions
log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')] $1${NC}"
}

error() {
    echo -e "${RED}[$(date +'%Y-%m-%d %H:%M:%S')] ERROR: $1${NC}" >&2
}

warn() {
    echo -e "${YELLOW}[$(date +'%Y-%m-%d %H:%M:%S')] WARNING: $1${NC}"
}

success() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')] ✅ $1${NC}"
}

# Function to check if we're in the right directory
check_directory() {
    if [ ! -f "package.json" ] || [ ! -f "docker-compose.yml" ]; then
        error "This doesn't look like the CEMSE project directory"
        error "Please run this script from $APP_PATH"
        exit 1
    fi
}

# Function to pull latest changes
pull_changes() {
    log "📥 Pulling latest changes from git..."

    if [ ! -d ".git" ]; then
        warn "Not a git repository, skipping git pull"
        return 0
    fi

    # Check if there are any changes
    git fetch
    LOCAL=$(git rev-parse HEAD)
    REMOTE=$(git rev-parse @{u} 2>/dev/null || echo $LOCAL)

    if [ "$LOCAL" = "$REMOTE" ]; then
        success "Already up to date"
        return 0
    fi

    # Pull changes
    git pull || {
        error "Git pull failed. Please resolve conflicts manually."
        exit 1
    }

    success "Changes pulled successfully"
}

# Function to install dependencies if needed
install_dependencies() {
    log "📦 Checking dependencies..."

    # Check if package.json changed
    if git diff HEAD~1 --name-only 2>/dev/null | grep -q "package.json\|pnpm-lock.yaml"; then
        log "Package files changed, installing dependencies..."
        pnpm install || {
            error "Failed to install dependencies"
            exit 1
        }
        success "Dependencies updated"
    else
        success "No dependency changes detected"
    fi
}

# Function to handle database migrations
handle_database() {
    log "🗄️ Handling database migrations..."

    # Check if docker containers are running
    if ! docker-compose ps | grep -q "Up"; then
        log "Starting Docker containers..."
        docker-compose up -d
        sleep 10
    fi

    # Generate Prisma client
    log "🔧 Generating Prisma client..."
    pnpm prisma generate || {
        error "Failed to generate Prisma client"
        exit 1
    }

    # Run migrations
    log "📊 Running database migrations..."
    pnpm prisma migrate deploy || {
        warn "Migration failed, this might be normal if no new migrations exist"
    }

    success "Database operations completed"
}

# Function to restart services
restart_services() {
    log "🔄 Restarting services..."

    # Restart Docker containers (backend)
    log "Restarting Docker containers..."
    docker-compose restart || {
        warn "Docker restart failed, trying to bring up containers..."
        docker-compose up -d
    }

    # Wait a moment for containers to be ready
    sleep 5

    # Restart the cemse service (Next.js app)
    log "Restarting CEMSE service..."
    if systemctl is-active --quiet cemse 2>/dev/null; then
        sudo systemctl restart cemse
    else
        warn "CEMSE service not running, starting it..."
        sudo systemctl start cemse
    fi

    success "Services restarted"
}

# Function to verify everything is working
verify_update() {
    log "🔍 Verifying update..."

    # Check Docker containers
    if docker-compose ps | grep -q "Up"; then
        success "Docker containers are running"
    else
        error "Some Docker containers failed to start"
        docker-compose ps
    fi

    # Check cemse service
    if systemctl is-active --quiet cemse 2>/dev/null; then
        success "CEMSE service is running"
    else
        error "CEMSE service failed to start"
        warn "Check logs with: sudo journalctl -u cemse -f"
    fi

    # Check if app is responding (wait a bit for startup)
    sleep 10
    if curl -f -s http://localhost:3000/api/health > /dev/null 2>&1; then
        success "Application is responding"
    else
        warn "Application health check failed, but this might be temporary"
        warn "Check status with: sudo systemctl status cemse"
    fi
}

# Function to show status
show_status() {
    echo ""
    echo "========================================="
    echo "📊 Update Complete!"
    echo "========================================="
    echo ""

    success "Update completed successfully!"
    echo ""

    log "🐳 Docker Status:"
    docker-compose ps
    echo ""

    log "🔧 Service Status:"
    if systemctl is-active --quiet cemse 2>/dev/null; then
        echo "✅ CEMSE service: Running"
    else
        echo "❌ CEMSE service: Not running"
    fi

    if systemctl is-active --quiet nginx 2>/dev/null; then
        echo "✅ Nginx: Running"
    else
        echo "❌ Nginx: Not running"
    fi
    echo ""

    log "🌐 Access URLs:"
    echo "   - Local: http://localhost:3000"
    echo "   - External: http://$(curl -s http://checkip.amazonaws.com 2>/dev/null || echo 'your-server-ip')"
    echo ""

    log "📝 Useful Commands:"
    echo "   - Check logs: sudo journalctl -u cemse -f"
    echo "   - Check status: sudo systemctl status cemse"
    echo "   - Manual restart: sudo systemctl restart cemse"
    echo "   - Docker logs: docker-compose logs -f"
    echo ""
}

# Main function
main() {
    echo ""
    echo "========================================="
    echo "🚀 CEMSE Update Script"
    echo "========================================="
    echo ""

    # Change to app directory if not already there
    if [ "$(pwd)" != "$APP_PATH" ]; then
        log "📁 Changing to $APP_PATH..."
        cd "$APP_PATH"
    fi

    # Check if we're in the right place
    check_directory

    # Perform update steps
    pull_changes
    install_dependencies
    handle_database
    restart_services
    verify_update
    show_status
}

# Show help if requested
if [ "$1" = "--help" ] || [ "$1" = "-h" ]; then
    echo "CEMSE Update Script"
    echo "Usage: $0"
    echo ""
    echo "This script will:"
    echo "  1. Pull latest changes from git"
    echo "  2. Install dependencies (if package.json changed)"
    echo "  3. Generate Prisma client"
    echo "  4. Run database migrations"
    echo "  5. Restart Docker containers (backend)"
    echo "  6. Restart CEMSE service (Next.js app)"
    echo "  7. Verify everything is working"
    echo ""
    echo "This replaces the manual process of:"
    echo "  - git pull"
    echo "  - pnpm install (if needed)"
    echo "  - pnpm prisma generate"
    echo "  - pnpm prisma migrate deploy"
    echo "  - docker-compose restart"
    echo "  - sudo systemctl restart cemse"
    echo ""
    exit 0
fi

# Run main function
main "$@"