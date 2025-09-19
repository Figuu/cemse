#!/bin/bash

# =============================================================================
# CEMSE Nginx Configuration Fix Script
# =============================================================================
# This script fixes the Nginx configuration issue
# =============================================================================

set -e  # Exit on any error

# Configuration
APP_NAME="cemse"
NGINX_CONFIG="/etc/nginx/sites-available/$APP_NAME"

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

# Function to check if running as root
check_root() {
    if [ "$EUID" -ne 0 ]; then
        error "This script must be run as root (use sudo)"
        exit 1
    fi
}

# Function to fix nginx configuration
fix_nginx_config() {
    log "🔧 Fixing Nginx configuration..."
    
    # Backup current configuration
    cp "$NGINX_CONFIG" "$NGINX_CONFIG.backup.$(date +%Y%m%d_%H%M%S)"
    
    # Fix the gzip_proxied directive
    sed -i 's/gzip_proxied expired no-cache no-store private must-revalidate auth;/gzip_proxied expired no-cache no-store private auth;/' "$NGINX_CONFIG"
    
    # Test nginx configuration
    if nginx -t; then
        success "Nginx configuration is now valid"
        
        # Reload nginx
        systemctl reload nginx
        success "Nginx reloaded successfully"
    else
        error "Nginx configuration still has errors"
        exit 1
    fi
}

# Function to show status
show_status() {
    echo ""
    echo "========================================="
    echo "🎉 Nginx Fix Complete!"
    echo "========================================="
    echo ""
    success "Nginx configuration has been fixed!"
    echo ""
    info "📋 Status:"
    echo "   - Nginx configuration: Valid"
    echo "   - Nginx service: Running"
    echo "   - Configuration file: $NGINX_CONFIG"
    echo ""
    info "🔧 Next Steps:"
    echo "1. Continue with the setup script"
    echo "2. Or run: cd /opt/cemse && ./deploy.sh"
    echo ""
}

# Main function
main() {
    echo ""
    echo "========================================="
    echo "🔧 $APP_NAME Nginx Fix"
    echo "========================================="
    echo ""
    
    # Check if running as root
    check_root
    
    # Fix nginx configuration
    fix_nginx_config
    
    # Show status
    show_status
}

# Run main function
main "$@"
