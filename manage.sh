#!/bin/bash

# =============================================================================
# CEMSE Application Management Script
# =============================================================================
# Unified script for managing the CEMSE application on AWS EC2
# =============================================================================

set -e  # Exit on any error

# Configuration
APP_NAME="cemse"
APP_PATH="/opt/$APP_NAME"
APP_PORT="3000"
BACKUP_DIR="$APP_PATH/backups"
RETENTION_DAYS=30

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
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

# Function to check if running as root
check_root() {
    if [[ $EUID -eq 0 ]]; then
        error "This script should not be run as root. Please run as a regular user with sudo privileges."
        exit 1
    fi
}

# Function to get server IP
get_server_ip() {
    curl -s http://checkip.amazonaws.com 2>/dev/null || hostname -I | awk '{print $1}'
}

# Function to start services
start_services() {
    log "🚀 Starting CEMSE services..."
    cd "$APP_PATH"

    docker-compose up -d
    sleep 10

    if docker-compose ps | grep -q "Up"; then
        success "Services started successfully"
        docker-compose ps
    else
        error "Failed to start some services"
        docker-compose ps
        exit 1
    fi
}

# Function to stop services
stop_services() {
    log "🛑 Stopping CEMSE services..."
    cd "$APP_PATH"

    docker-compose down
    success "Services stopped"
}

# Function to restart services
restart_services() {
    log "🔄 Restarting CEMSE services..."
    cd "$APP_PATH"

    docker-compose down
    docker-compose up -d --build
    sleep 10

    if docker-compose ps | grep -q "Up"; then
        success "Services restarted successfully"
        docker-compose ps
    else
        error "Failed to restart some services"
        docker-compose ps
        exit 1
    fi
}

# Function to show status
show_status() {
    log "📊 CEMSE Application Status"
    echo ""

    # System info
    info "System Information:"
    echo "  - OS: $(lsb_release -d | cut -f2 2>/dev/null || echo "Unknown")"
    echo "  - Uptime: $(uptime -p 2>/dev/null || echo "Unknown")"
    echo "  - Load: $(uptime | awk -F'load average:' '{print $2}' 2>/dev/null || echo "Unknown")"
    echo "  - Memory: $(free -h | grep Mem | awk '{print $3 "/" $2}' 2>/dev/null || echo "Unknown")"
    echo "  - Disk: $(df -h $APP_PATH | tail -1 | awk '{print $3 "/" $2 " (" $5 ")"}' 2>/dev/null || echo "Unknown")"
    echo ""

    # Docker containers
    info "Docker Containers:"
    if command -v docker-compose &> /dev/null; then
        cd "$APP_PATH"
        docker-compose ps
    else
        warn "Docker Compose not found"
    fi
    echo ""

    # Service status
    info "Systemd Service:"
    if systemctl is-active --quiet "$APP_NAME" 2>/dev/null; then
        success "Service $APP_NAME is running"
    else
        warn "Service $APP_NAME is not running"
    fi

    if systemctl is-active --quiet nginx 2>/dev/null; then
        success "Nginx is running"
    else
        warn "Nginx is not running"
    fi
    echo ""

    # Application health
    info "Application Health:"
    if curl -f -s "http://localhost:$APP_PORT/api/health" > /dev/null 2>&1; then
        success "Application is responding"
    else
        warn "Application is not responding"
    fi
}

# Function to show logs
show_logs() {
    log "📝 Showing application logs..."
    cd "$APP_PATH"

    if [ "$2" = "follow" ] || [ "$2" = "-f" ]; then
        docker-compose logs -f
    else
        docker-compose logs --tail=50
    fi
}

# Function to deploy application
deploy_app() {
    log "🚀 Deploying CEMSE application..."
    cd "$APP_PATH"

    # Check system resources
    local memory_gb=$(free -g | awk '/^Mem:/{print $2}')
    if [ $memory_gb -lt 2 ]; then
        warn "Low memory detected (${memory_gb}GB). Creating swap if needed..."
        if ! swapon --show | grep -q '/swapfile'; then
            sudo fallocate -l 2G /swapfile || true
            sudo chmod 600 /swapfile || true
            sudo mkswap /swapfile || true
            sudo swapon /swapfile || true
            echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab || true
        fi
    fi

    # Pull latest changes if git repo
    if [ -d ".git" ]; then
        log "📥 Pulling latest changes..."
        git pull
    fi

    # Install dependencies
    log "📦 Installing dependencies..."
    export NODE_OPTIONS="--max-old-space-size=2048"
    pnpm install --frozen-lockfile --prefer-offline || pnpm install --frozen-lockfile

    # Generate Prisma client
    log "🔧 Generating Prisma client..."
    pnpm prisma generate

    # Run migrations if database is available
    if docker-compose ps db | grep -q "Up"; then
        log "🗄️ Running database migrations..."
        pnpm prisma migrate deploy
    else
        warn "Database not available, skipping migrations"
    fi

    # Build application
    log "🏗️ Building application..."
    pnpm build

    # Restart services
    restart_services

    # Verify deployment
    sleep 10
    if curl -f -s "http://localhost:$APP_PORT/api/health" > /dev/null 2>&1; then
        success "Deployment completed successfully!"
        echo ""
        info "🌐 Application accessible at:"
        echo "   - Local: http://localhost:$APP_PORT"
        echo "   - External: http://$(get_server_ip):$APP_PORT"
        echo ""
    else
        warn "Deployment completed but health check failed"
    fi
}

# Function to backup application
backup_app() {
    log "💾 Creating backup..."
    local date=$(date +%Y%m%d_%H%M%S)

    # Create backup directory
    mkdir -p "$BACKUP_DIR"

    cd "$APP_PATH"

    # Backup database
    if docker-compose ps db | grep -q "Up"; then
        log "🗄️ Backing up database..."
        docker-compose exec -T db pg_dump -U postgres cemse_prod > "$BACKUP_DIR/db_backup_$date.sql" || warn "Database backup failed"
        gzip "$BACKUP_DIR/db_backup_$date.sql" 2>/dev/null || true
    fi

    # Backup uploads
    if [ -d "public/uploads" ]; then
        log "📁 Backing up uploads..."
        tar -czf "$BACKUP_DIR/uploads_backup_$date.tar.gz" public/uploads/ 2>/dev/null || warn "Uploads backup failed"
    fi

    # Backup configuration
    log "⚙️ Backing up configuration..."
    mkdir -p "$BACKUP_DIR/config_$date"
    [ -f ".env" ] && cp .env "$BACKUP_DIR/config_$date/"
    [ -f "docker-compose.yml" ] && cp docker-compose.yml "$BACKUP_DIR/config_$date/"
    tar -czf "$BACKUP_DIR/config_backup_$date.tar.gz" -C "$BACKUP_DIR" "config_$date" 2>/dev/null || true
    rm -rf "$BACKUP_DIR/config_$date"

    # Clean old backups
    log "🧹 Cleaning old backups..."
    find "$BACKUP_DIR" -name "*.sql.gz" -mtime +$RETENTION_DAYS -delete 2>/dev/null || true
    find "$BACKUP_DIR" -name "*.tar.gz" -mtime +$RETENTION_DAYS -delete 2>/dev/null || true

    success "Backup completed: $BACKUP_DIR"
    ls -la "$BACKUP_DIR"/*_$date.* 2>/dev/null || true
}

# Function to configure domain
configure_domain() {
    local new_domain="$2"

    if [ -z "$new_domain" ]; then
        echo "Usage: $0 domain <new-domain>"
        echo "Example: $0 domain myapp.example.com"
        exit 1
    fi

    log "🌐 Configuring domain: $new_domain"

    # Update nginx configuration if it exists
    if [ -f "/etc/nginx/sites-available/$APP_NAME" ]; then
        log "📝 Updating Nginx configuration..."
        sudo sed -i "s/server_name .*/server_name $new_domain www.$new_domain;/" "/etc/nginx/sites-available/$APP_NAME"

        if sudo nginx -t; then
            sudo systemctl reload nginx
            success "Nginx configuration updated"
        else
            error "Nginx configuration error"
            exit 1
        fi
    fi

    # Update environment file
    if [ -f "$APP_PATH/.env" ]; then
        log "⚙️ Updating environment file..."
        sed -i "s|NEXT_PUBLIC_APP_URL=.*|NEXT_PUBLIC_APP_URL=\"https://$new_domain\"|" "$APP_PATH/.env"
        success "Environment file updated"
    fi

    local server_ip=$(get_server_ip)
    echo ""
    info "📋 DNS Configuration:"
    echo "   Point $new_domain A record to: $server_ip"
    echo "   Point www.$new_domain A record to: $server_ip"
    echo ""
    info "📋 Next Steps:"
    echo "   1. Configure DNS records as shown above"
    echo "   2. Wait for DNS propagation"
    echo "   3. Run: $0 ssl"
    echo "   4. Run: $0 restart"
}

# Function to setup SSL
setup_ssl() {
    log "🔒 Setting up SSL certificate..."

    # Check if certbot is installed
    if ! command -v certbot &> /dev/null; then
        error "Certbot is not installed. Please install it first."
        exit 1
    fi

    # Get domain from nginx config
    if [ -f "/etc/nginx/sites-available/$APP_NAME" ]; then
        local domain=$(grep "server_name" "/etc/nginx/sites-available/$APP_NAME" | head -1 | awk '{print $2}' | sed 's/;//' | sed 's/www\.//')

        if [ -n "$domain" ] && [ "$domain" != "_" ]; then
            log "📋 Setting up SSL for domain: $domain"

            # Check DNS resolution
            if nslookup "$domain" > /dev/null 2>&1; then
                sudo certbot --nginx -d "$domain" -d "www.$domain" --non-interactive --agree-tos --email "admin@$domain" --redirect || {
                    error "SSL setup failed"
                    exit 1
                }
                success "SSL certificate installed successfully"
            else
                error "Domain $domain does not resolve. Please configure DNS first."
                exit 1
            fi
        else
            error "No valid domain found in Nginx configuration"
            exit 1
        fi
    else
        error "Nginx configuration not found"
        exit 1
    fi
}

# Function to show help
show_help() {
    echo "CEMSE Application Management Script"
    echo "Usage: $0 <command> [options]"
    echo ""
    echo "Commands:"
    echo "  start           Start all services"
    echo "  stop            Stop all services"
    echo "  restart         Restart all services"
    echo "  status          Show application status"
    echo "  logs [follow]   Show application logs (add 'follow' to tail)"
    echo "  deploy          Deploy/update application"
    echo "  backup          Create backup of application data"
    echo "  domain <name>   Configure domain name"
    echo "  ssl             Setup SSL certificate"
    echo "  health          Run health check"
    echo "  help            Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0 start"
    echo "  $0 logs follow"
    echo "  $0 domain myapp.example.com"
    echo "  $0 deploy"
    echo ""
}

# Function to run health check
health_check() {
    log "🏥 Running health check..."

    local overall_status="HEALTHY"
    local issues=()

    # Check system resources
    info "🔍 Checking system resources..."
    local memory_usage=$(free | grep Mem | awk '{printf "%.1f", $3/$2 * 100.0}')
    local disk_usage=$(df -h $APP_PATH | awk 'NR==2 {print $5}' | sed 's/%//')

    if (( $(echo "$memory_usage > 90" | bc -l) )); then
        warn "High memory usage: ${memory_usage}%"
        overall_status="UNHEALTHY"
        issues+=("High memory usage")
    else
        success "Memory usage: ${memory_usage}%"
    fi

    if [ $disk_usage -gt 90 ]; then
        warn "High disk usage: ${disk_usage}%"
        overall_status="UNHEALTHY"
        issues+=("High disk usage")
    else
        success "Disk usage: ${disk_usage}%"
    fi

    # Check Docker containers
    info "🐳 Checking Docker containers..."
    cd "$APP_PATH"
    if docker-compose ps | grep -q "Up"; then
        success "Docker containers are running"
    else
        error "Some Docker containers are not running"
        overall_status="UNHEALTHY"
        issues+=("Docker containers")
    fi

    # Check application health
    info "🌐 Checking application health..."
    if curl -f -s "http://localhost:$APP_PORT/api/health" > /dev/null 2>&1; then
        success "Application is responding"
    else
        error "Application is not responding"
        overall_status="UNHEALTHY"
        issues+=("Application not responding")
    fi

    # Show overall status
    echo ""
    if [ "$overall_status" = "HEALTHY" ]; then
        success "Overall Status: $overall_status"
        return 0
    else
        error "Overall Status: $overall_status"
        warn "Issues found: ${issues[*]}"
        return 1
    fi
}

# Main function
main() {
    # Check if running as root
    check_root

    case "$1" in
        start)
            start_services
            ;;
        stop)
            stop_services
            ;;
        restart)
            restart_services
            ;;
        status)
            show_status
            ;;
        logs)
            show_logs "$@"
            ;;
        deploy)
            deploy_app
            ;;
        backup)
            backup_app
            ;;
        domain)
            configure_domain "$@"
            ;;
        ssl)
            setup_ssl
            ;;
        health)
            health_check
            ;;
        help|--help|-h)
            show_help
            ;;
        *)
            error "Unknown command: $1"
            echo ""
            show_help
            exit 1
            ;;
    esac
}

# Run main function with all arguments
main "$@"