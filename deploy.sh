#!/bin/bash

# =============================================================================
# CEMSE Application Deployment Script for Ubuntu Server 24.04 LTS
# =============================================================================
# This script handles the complete deployment process including dependencies,
# database migrations, building, and service restart.
# =============================================================================

set -e  # Exit on any error

# Configuration
APP_NAME="cemse"
APP_PATH="/opt/$APP_NAME"
APP_PORT="3000"

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

info() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')] INFO: $1${NC}"
}

success() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')] ✅ $1${NC}"
}

# Function to check system resources
check_resources() {
    log "🔍 Checking system resources..."
    
    # Check available memory
    MEMORY_GB=$(free -g | awk '/^Mem:/{print $2}')
    if [ $MEMORY_GB -lt 2 ]; then
        warn "Low memory detected (${MEMORY_GB}GB). Consider adding swap space."
        
        # Check if swap exists
        if ! swapon --show | grep -q '/swapfile'; then
            warn "No swap file found. Creating 2GB swap file..."
            sudo fallocate -l 2G /swapfile
            sudo chmod 600 /swapfile
            sudo mkswap /swapfile
            sudo swapon /swapfile
            
            # Make swap permanent
            if ! grep -q '/swapfile' /etc/fstab; then
                echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
            fi
            
            success "Swap file created and activated"
        fi
    else
        success "Memory check passed (${MEMORY_GB}GB available)"
    fi
    
    # Check disk space
    DISK_USAGE=$(df -h $APP_PATH | awk 'NR==2 {print $5}' | sed 's/%//')
    if [ $DISK_USAGE -gt 90 ]; then
        warn "High disk usage detected (${DISK_USAGE}%). Consider cleaning up."
    else
        success "Disk space check passed (${DISK_USAGE}% used)"
    fi
}

# Function to install dependencies with memory management
install_dependencies() {
    log "📦 Installing dependencies..."
    
    # Set Node.js memory options for better handling
    export NODE_OPTIONS="--max-old-space-size=2048"
    
    # Try installing with different strategies
    if ! pnpm install --frozen-lockfile --prefer-offline 2>/dev/null; then
        warn "Regular install failed, trying with reduced parallelism..."
        
        if ! pnpm install --frozen-lockfile --prefer-offline --no-optional 2>/dev/null; then
            warn "Install with no-optional failed, trying production only..."
            
            if ! NODE_ENV=production pnpm install --frozen-lockfile --prod 2>/dev/null; then
                error "All install methods failed. You may need more memory or a larger instance."
                exit 1
            fi
        fi
    fi
    
    success "Dependencies installed successfully"
}

# Function to backup current deployment
backup_current() {
    log "💾 Creating backup of current deployment..."
    
    BACKUP_DIR="$APP_PATH/backups"
    DATE=$(date +%Y%m%d_%H%M%S)
    
    # Create backup directory
    mkdir -p $BACKUP_DIR
    
    # Backup current build
    if [ -d "$APP_PATH/.next" ]; then
        tar -czf $BACKUP_DIR/build_backup_$DATE.tar.gz .next/ 2>/dev/null || true
    fi
    
    # Backup environment file
    if [ -f "$APP_PATH/.env" ]; then
        cp $APP_PATH/.env $BACKUP_DIR/env_backup_$DATE
    fi
    
    # Clean old backups (keep last 5)
    find $BACKUP_DIR -name "build_backup_*.tar.gz" -type f | sort | head -n -5 | xargs rm -f 2>/dev/null || true
    find $BACKUP_DIR -name "env_backup_*" -type f | sort | head -n -5 | xargs rm -f 2>/dev/null || true
    
    success "Backup created"
}

# Function to check database connectivity
check_database() {
    log "🗄️ Checking database connectivity..."
    
    # Check if database container is running
    if docker-compose ps db | grep -q "Up"; then
        success "Database container is running"
        return 0
    else
        warn "Database container not running, starting it..."
        docker-compose up -d db
        sleep 10
        
        if docker-compose ps db | grep -q "Up"; then
            success "Database container started successfully"
            return 0
        else
            error "Failed to start database container"
            return 1
        fi
    fi
}

# Function to run database migrations
run_migrations() {
    log "🗄️ Running database migrations..."
    
    if check_database; then
        # Wait for database to be ready
        log "Waiting for database to be ready..."
        sleep 5
        
        # Run migrations
        if pnpm prisma migrate deploy; then
            success "Database migrations completed"
            
            # Seed database if in development mode
            if [ "${NODE_ENV:-development}" = "development" ]; then
                log "Seeding database..."
                if pnpm prisma db seed; then
                    success "Database seeded successfully"
                else
                    warn "Database seeding failed, but continuing..."
                fi
            else
                info "Skipping database seeding in production mode"
            fi
        else
            error "Database migrations failed"
            exit 1
        fi
    else
        warn "Skipping migrations - database not available"
    fi
}

# Function to build application
build_application() {
    log "🏗️ Building application..."
    
    # Set Node.js memory options
    export NODE_OPTIONS="--max-old-space-size=2048"
    
    # Clean previous build
    if [ -d "$APP_PATH/.next" ]; then
        rm -rf $APP_PATH/.next
    fi
    
    # Build application
    if pnpm build; then
        success "Application built successfully"
    else
        error "Build failed"
        exit 1
    fi
}

# Function to restart services
restart_services() {
    log "🔄 Restarting services..."
    
    # Stop current services
    docker-compose down
    
    # Start services
    docker-compose up --build -d
    
    # Wait for services to start
    sleep 10
    
    success "Services restarted"
}

# Function to verify deployment
verify_deployment() {
    log "🔍 Verifying deployment..."
    
    # Check if containers are running
    if docker-compose ps | grep -q "Up"; then
        success "Containers are running"
    else
        error "Some containers failed to start"
        docker-compose ps
        exit 1
    fi
    
    # Check if application is responding
    sleep 5
    if curl -f -s http://localhost:$APP_PORT/api/health > /dev/null 2>&1; then
        success "Application is responding"
    else
        warn "Application health check failed, but containers are running"
    fi
    
    # Show running containers
    echo ""
    log "📊 Running containers:"
    docker-compose ps
}

# Function to show deployment summary
show_summary() {
    echo ""
    echo "========================================="
    echo "🎉 Deployment Complete!"
    echo "========================================="
    echo ""
    success "Deployment completed successfully!"
    echo ""
    info "🌐 Access Information:"
    echo "   - Local: http://localhost:$APP_PORT"
    echo "   - External: http://$(curl -s http://checkip.amazonaws.com 2>/dev/null || echo 'your-server-ip')"
    echo "   - MinIO: http://$(curl -s http://checkip.amazonaws.com 2>/dev/null || echo 'your-server-ip'):9000"
    echo "   - MinIO Console: http://$(curl -s http://checkip.amazonaws.com 2>/dev/null || echo 'your-server-ip'):9001"
    echo ""
    info "🔧 Management Commands:"
    echo "   - Status: $APP_NAME-manage status"
    echo "   - Logs: $APP_NAME-manage logs"
    echo "   - Restart: $APP_NAME-manage restart"
    echo "   - SSL: $APP_NAME-manage ssl"
    echo ""
}

# Main deployment process
main() {
    log "🚀 Starting $APP_NAME application deployment..."
    
    # Change to application directory
    cd $APP_PATH
    
    # Check system resources
    check_resources
    
    # Create backup
    backup_current
    
    # Pull latest changes
    if [ -d ".git" ]; then
        log "📥 Pulling latest changes from git..."
        git pull
    fi
    
    # Ensure pnpm is available
    if ! command -v pnpm &> /dev/null; then
        error "pnpm not found. Please run the setup script first."
        exit 1
    fi
    
    # Install dependencies
    install_dependencies
    
    # Generate Prisma client
    log "🔧 Generating Prisma client..."
    export NODE_OPTIONS="--max-old-space-size=2048"
    if ! pnpm prisma generate; then
        error "Failed to generate Prisma client"
        exit 1
    fi
    
    # Run database migrations
    run_migrations
    
    # Build application
    build_application
    
    # Restart services
    restart_services
    
    # Verify deployment
    verify_deployment
    
    # Show summary
    show_summary
}

# Run main function
main "$@"