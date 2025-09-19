#!/bin/bash

# =============================================================================
# CEMSE Health Check Script for Ubuntu Server 24.04 LTS
# =============================================================================
# This script performs comprehensive health checks on the CEMSE application
# =============================================================================

set -e  # Exit on any error

# Configuration
APP_NAME="cemse"
APP_PATH="/opt/$APP_NAME"
APP_PORT="3000"
HEALTH_CHECK_URL="http://localhost:$APP_PORT/api/health"

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

# Function to check system resources
check_system_resources() {
    log "🔍 Checking system resources..."
    
    # Check memory usage
    local memory_usage=$(free | grep Mem | awk '{printf "%.1f", $3/$2 * 100.0}')
    if (( $(echo "$memory_usage > 90" | bc -l) )); then
        warn "High memory usage: ${memory_usage}%"
    else
        success "Memory usage: ${memory_usage}%"
    fi
    
    # Check disk usage
    local disk_usage=$(df -h $APP_PATH | awk 'NR==2 {print $5}' | sed 's/%//')
    if [ $disk_usage -gt 90 ]; then
        warn "High disk usage: ${disk_usage}%"
    else
        success "Disk usage: ${disk_usage}%"
    fi
    
    # Check CPU load
    local cpu_load=$(uptime | awk -F'load average:' '{print $2}' | awk '{print $1}' | sed 's/,//')
    if (( $(echo "$cpu_load > 5" | bc -l) )); then
        warn "High CPU load: $cpu_load"
    else
        success "CPU load: $cpu_load"
    fi
}

# Function to check Docker containers
check_docker_containers() {
    log "🐳 Checking Docker containers..."
    
    # Check if Docker is running
    if ! systemctl is-active --quiet docker; then
        error "Docker service is not running"
        return 1
    fi
    
    # Check container status
    local containers=$(docker-compose ps --services)
    local all_healthy=true
    
    for container in $containers; do
        local status=$(docker-compose ps $container | grep $container | awk '{print $3}')
        if [ "$status" = "Up" ]; then
            success "Container $container is running"
        else
            error "Container $container is not running (Status: $status)"
            all_healthy=false
        fi
    done
    
    if [ "$all_healthy" = true ]; then
        success "All Docker containers are healthy"
        return 0
    else
        return 1
    fi
}

# Function to check database connectivity
check_database() {
    log "🗄️ Checking database connectivity..."
    
    # Check if database container is running
    if docker-compose ps db | grep -q "Up"; then
        # Test database connection
        if docker-compose exec -T db pg_isready -U postgres -d cemse_prod > /dev/null 2>&1; then
            success "Database is accessible"
            return 0
        else
            error "Database is not accessible"
            return 1
        fi
    else
        error "Database container is not running"
        return 1
    fi
}

# Function to check Redis connectivity
check_redis() {
    log "🔴 Checking Redis connectivity..."
    
    # Check if Redis container is running
    if docker-compose ps redis | grep -q "Up"; then
        # Test Redis connection
        if docker-compose exec -T redis redis-cli ping > /dev/null 2>&1; then
            success "Redis is accessible"
            return 0
        else
            error "Redis is not accessible"
            return 1
        fi
    else
        error "Redis container is not running"
        return 1
    fi
}

# Function to check MinIO connectivity
check_minio() {
    log "📦 Checking MinIO connectivity..."
    
    # Check if MinIO container is running
    if docker-compose ps minio | grep -q "Up"; then
        # Test MinIO connection
        if curl -f -s http://localhost:9000/minio/health/live > /dev/null 2>&1; then
            success "MinIO is accessible"
            return 0
        else
            error "MinIO is not accessible"
            return 1
        fi
    else
        error "MinIO container is not running"
        return 1
    fi
}

# Function to check application health
check_application() {
    log "🌐 Checking application health..."
    
    # Check if application is responding
    if curl -f -s "$HEALTH_CHECK_URL" > /dev/null 2>&1; then
        success "Application is responding"
        return 0
    else
        error "Application is not responding"
        return 1
    fi
}

# Function to check Nginx status
check_nginx() {
    log "🌐 Checking Nginx status..."
    
    # Check if Nginx is running
    if systemctl is-active --quiet nginx; then
        success "Nginx is running"
        
        # Test Nginx configuration
        if nginx -t > /dev/null 2>&1; then
            success "Nginx configuration is valid"
            return 0
        else
            error "Nginx configuration has errors"
            return 1
        fi
    else
        error "Nginx is not running"
        return 1
    fi
}

# Function to check SSL certificate
check_ssl() {
    log "🔒 Checking SSL certificate..."
    
    # Get domain from nginx config
    if [ -f "/etc/nginx/sites-available/$APP_NAME" ]; then
        local domain=$(grep "server_name" "/etc/nginx/sites-available/$APP_NAME" | head -1 | awk '{print $2}' | sed 's/;//' | sed 's/www\.//')
        
        if [ -f "/etc/letsencrypt/live/$domain/cert.pem" ]; then
            # Check certificate expiration
            local expiry_date=$(openssl x509 -in "/etc/letsencrypt/live/$domain/cert.pem" -noout -dates | grep notAfter | cut -d= -f2)
            local expiry_timestamp=$(date -d "$expiry_date" +%s)
            local current_timestamp=$(date +%s)
            local days_until_expiry=$(( (expiry_timestamp - current_timestamp) / 86400 ))
            
            if [ $days_until_expiry -gt 30 ]; then
                success "SSL certificate is valid (expires in $days_until_expiry days)"
                return 0
            elif [ $days_until_expiry -gt 7 ]; then
                warn "SSL certificate expires in $days_until_expiry days"
                return 0
            else
                error "SSL certificate expires in $days_until_expiry days"
                return 1
            fi
        else
            info "No SSL certificate found for domain: $domain"
            return 0
        fi
    else
        info "Nginx configuration not found, skipping SSL check"
        return 0
    fi
}

# Function to check systemd services
check_systemd_services() {
    log "🔧 Checking systemd services..."
    
    local services=("$APP_NAME" "nginx" "docker")
    local all_healthy=true
    
    for service in "${services[@]}"; do
        if systemctl is-active --quiet $service; then
            success "Service $service is running"
        else
            error "Service $service is not running"
            all_healthy=false
        fi
    done
    
    if [ "$all_healthy" = true ]; then
        success "All systemd services are healthy"
        return 0
    else
        return 1
    fi
}

# Function to check firewall
check_firewall() {
    log "🔥 Checking firewall status..."
    
    if systemctl is-active --quiet ufw; then
        success "UFW firewall is active"
        
        # Check if required ports are open
        local required_ports=("80" "443" "$APP_PORT")
        for port in "${required_ports[@]}"; do
            if ufw status | grep -q "$port"; then
                success "Port $port is open"
            else
                warn "Port $port may not be open"
            fi
        done
        return 0
    else
        warn "UFW firewall is not active"
        return 0
    fi
}

# Function to check log files
check_logs() {
    log "📝 Checking log files..."
    
    # Check for recent errors in application logs
    if [ -f "/var/log/nginx/${APP_NAME}_error.log" ]; then
        local error_count=$(tail -100 "/var/log/nginx/${APP_NAME}_error.log" | grep -c "error" || echo "0")
        if [ $error_count -gt 10 ]; then
            warn "High number of errors in Nginx logs: $error_count"
        else
            success "Nginx logs look healthy"
        fi
    fi
    
    # Check systemd service logs
    if journalctl -u $APP_NAME --since "1 hour ago" | grep -q "error\|failed"; then
        warn "Recent errors found in $APP_NAME service logs"
    else
        success "Service logs look healthy"
    fi
}

# Function to generate health report
generate_health_report() {
    local overall_status="HEALTHY"
    local issues=()
    
    echo ""
    echo "========================================="
    echo "🏥 Health Check Report"
    echo "========================================="
    echo ""
    
    # Run all health checks
    check_system_resources || { overall_status="UNHEALTHY"; issues+=("System resources"); }
    check_docker_containers || { overall_status="UNHEALTHY"; issues+=("Docker containers"); }
    check_database || { overall_status="UNHEALTHY"; issues+=("Database"); }
    check_redis || { overall_status="UNHEALTHY"; issues+=("Redis"); }
    check_minio || { overall_status="UNHEALTHY"; issues+=("MinIO"); }
    check_application || { overall_status="UNHEALTHY"; issues+=("Application"); }
    check_nginx || { overall_status="UNHEALTHY"; issues+=("Nginx"); }
    check_ssl || { overall_status="UNHEALTHY"; issues+=("SSL certificate"); }
    check_systemd_services || { overall_status="UNHEALTHY"; issues+=("Systemd services"); }
    check_firewall || { overall_status="UNHEALTHY"; issues+=("Firewall"); }
    check_logs || { overall_status="UNHEALTHY"; issues+=("Log files"); }
    
    # Display overall status
    if [ "$overall_status" = "HEALTHY" ]; then
        success "Overall Status: $overall_status"
    else
        error "Overall Status: $overall_status"
        echo ""
        warn "Issues found:"
        for issue in "${issues[@]}"; do
            echo "  - $issue"
        done
    fi
    
    echo ""
    info "📋 System Information:"
    echo "  - OS: $(lsb_release -d | cut -f2)"
    echo "  - Kernel: $(uname -r)"
    echo "  - Uptime: $(uptime -p)"
    echo "  - Load: $(uptime | awk -F'load average:' '{print $2}')"
    echo "  - Memory: $(free -h | grep Mem | awk '{print $3 "/" $2}')"
    echo "  - Disk: $(df -h $APP_PATH | tail -1 | awk '{print $3 "/" $2 " (" $5 ")"}')"
    echo ""
    
    # Return appropriate exit code
    if [ "$overall_status" = "HEALTHY" ]; then
        return 0
    else
        return 1
    fi
}

# Main function
main() {
    echo ""
    echo "========================================="
    echo "🏥 $APP_NAME Health Check"
    echo "========================================="
    echo ""
    
    # Change to application directory
    cd "$APP_PATH"
    
    # Generate health report
    generate_health_report
}

# Show help if requested
if [ "$1" = "--help" ] || [ "$1" = "-h" ]; then
    echo "Usage: $0"
    echo ""
    echo "This script will:"
    echo "  - Check system resources (CPU, memory, disk)"
    echo "  - Check Docker containers"
    echo "  - Check database connectivity"
    echo "  - Check Redis connectivity"
    echo "  - Check MinIO connectivity"
    echo "  - Check application health"
    echo "  - Check Nginx status"
    echo "  - Check SSL certificate"
    echo "  - Check systemd services"
    echo "  - Check firewall status"
    echo "  - Check log files"
    echo "  - Generate health report"
    echo ""
    exit 0
fi

# Run main function
main "$@"
