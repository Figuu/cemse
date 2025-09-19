#!/bin/bash

# =============================================================================
# CEMSE Domain Configuration Script for Ubuntu Server 24.04 LTS
# =============================================================================
# This script helps configure domain settings for the CEMSE application
# =============================================================================

set -e  # Exit on any error

# Configuration
APP_NAME="cemse"
APP_PATH="/opt/$APP_NAME"
NGINX_CONFIG="/etc/nginx/sites-available/$APP_NAME"

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

# Function to get current server IP
get_server_ip() {
    # Try multiple methods to get public IP
    PUBLIC_IP=""
    
    # Method 1: AWS metadata
    if command -v curl &> /dev/null; then
        PUBLIC_IP=$(curl -s http://checkip.amazonaws.com 2>/dev/null || echo "")
    fi
    
    # Method 2: Alternative service
    if [ -z "$PUBLIC_IP" ] && command -v curl &> /dev/null; then
        PUBLIC_IP=$(curl -s http://ipinfo.io/ip 2>/dev/null || echo "")
    fi
    
    # Method 3: Alternative service
    if [ -z "$PUBLIC_IP" ] && command -v curl &> /dev/null; then
        PUBLIC_IP=$(curl -s http://icanhazip.com 2>/dev/null || echo "")
    fi
    
    # Method 4: Local IP as fallback
    if [ -z "$PUBLIC_IP" ]; then
        PUBLIC_IP=$(hostname -I | awk '{print $1}')
        warn "Could not determine public IP, using local IP: $PUBLIC_IP"
    fi
    
    echo "$PUBLIC_IP"
}

# Function to validate domain format
validate_domain() {
    local domain="$1"
    
    # Basic domain validation regex
    if [[ $domain =~ ^[a-zA-Z0-9]([a-zA-Z0-9\-]{0,61}[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9\-]{0,61}[a-zA-Z0-9])?)*$ ]]; then
        return 0
    else
        return 1
    fi
}

# Function to check DNS resolution
check_dns() {
    local domain="$1"
    local expected_ip="$2"
    
    log "🔍 Checking DNS resolution for $domain..."
    
    # Check if domain resolves
    if ! nslookup "$domain" > /dev/null 2>&1; then
        warn "Domain $domain does not resolve to any IP address"
        return 1
    fi
    
    # Get resolved IP
    local resolved_ip=$(nslookup "$domain" | grep -A 1 "Name:" | tail -1 | awk '{print $2}')
    
    if [ "$resolved_ip" = "$expected_ip" ]; then
        success "DNS is correctly configured ($domain -> $resolved_ip)"
        return 0
    else
        warn "DNS mismatch: $domain resolves to $resolved_ip, expected $expected_ip"
        return 1
    fi
}

# Function to update nginx configuration
update_nginx_config() {
    local domain="$1"
    local old_domain="$2"
    
    log "🌐 Updating Nginx configuration..."
    
    # Backup current configuration
    sudo cp "$NGINX_CONFIG" "$NGINX_CONFIG.backup.$(date +%Y%m%d_%H%M%S)"
    
    # Update domain in nginx configuration
    sudo sed -i "s/server_name .*/server_name $domain www.$domain;/" "$NGINX_CONFIG"
    
    # Test nginx configuration
    if sudo nginx -t; then
        sudo systemctl reload nginx
        success "Nginx configuration updated successfully"
        return 0
    else
        error "Nginx configuration test failed, reverting changes..."
        sudo cp "$NGINX_CONFIG.backup.$(date +%Y%m%d_%H%M%S)" "$NGINX_CONFIG"
        return 1
    fi
}

# Function to update environment file
update_env_file() {
    local domain="$1"
    local old_domain="$2"
    
    log "⚙️ Updating environment configuration..."
    
    if [ -f "$APP_PATH/.env" ]; then
        # Backup environment file
        cp "$APP_PATH/.env" "$APP_PATH/.env.backup.$(date +%Y%m%d_%H%M%S)"
        
        # Update domain in environment file
        sed -i "s|NEXT_PUBLIC_APP_URL=.*|NEXT_PUBLIC_APP_URL=\"https://$domain\"|" "$APP_PATH/.env"
        
        success "Environment file updated"
    else
        warn "Environment file not found at $APP_PATH/.env"
    fi
}

# Function to show DNS instructions
show_dns_instructions() {
    local domain="$1"
    local server_ip="$2"
    
    echo ""
    echo "========================================="
    echo "🌐 DNS Configuration Instructions"
    echo "========================================="
    echo ""
    info "To complete the domain setup, configure these DNS records:"
    echo ""
    echo "📋 DNS Records to create:"
    echo "   Type: A"
    echo "   Name: $domain"
    echo "   Value: $server_ip"
    echo "   TTL: 300 (or default)"
    echo ""
    echo "   Type: A"
    echo "   Name: www.$domain"
    echo "   Value: $server_ip"
    echo "   TTL: 300 (or default)"
    echo ""
    echo "📋 DNS Records to create (if using Cloudflare):"
    echo "   Type: A"
    echo "   Name: $domain"
    echo "   Value: $server_ip"
    echo "   Proxy status: Proxied (orange cloud)"
    echo ""
    echo "   Type: A"
    echo "   Name: www.$domain"
    echo "   Value: $server_ip"
    echo "   Proxy status: Proxied (orange cloud)"
    echo ""
    info "⏱️  DNS propagation can take up to 48 hours"
    info "🔍 Check DNS propagation: https://dnschecker.org/"
    echo ""
}

# Function to test domain configuration
test_domain() {
    local domain="$1"
    
    log "🧪 Testing domain configuration..."
    
    # Test HTTP access
    if curl -f -s "http://$domain" > /dev/null 2>&1; then
        success "HTTP access working for $domain"
    else
        warn "HTTP access not working for $domain"
    fi
    
    # Test HTTPS access (if SSL is configured)
    if curl -f -s "https://$domain" > /dev/null 2>&1; then
        success "HTTPS access working for $domain"
    else
        info "HTTPS not configured yet (run SSL setup after DNS propagation)"
    fi
}

# Function to show current configuration
show_current_config() {
    log "📋 Current domain configuration:"
    
    # Get current domain from nginx config
    if [ -f "$NGINX_CONFIG" ]; then
        local current_domain=$(grep "server_name" "$NGINX_CONFIG" | head -1 | awk '{print $2}' | sed 's/;//')
        info "Nginx domain: $current_domain"
    fi
    
    # Get current domain from environment file
    if [ -f "$APP_PATH/.env" ]; then
        local env_domain=$(grep "NEXT_PUBLIC_APP_URL" "$APP_PATH/.env" | cut -d'"' -f2 | sed 's|https://||')
        info "Environment domain: $env_domain"
    fi
    
    # Get server IP
    local server_ip=$(get_server_ip)
    info "Server IP: $server_ip"
    
    echo ""
}

# Main function
main() {
    echo ""
    echo "========================================="
    echo "🌐 $APP_NAME Domain Configuration"
    echo "========================================="
    echo ""
    
    # Show current configuration
    show_current_config
    
    # Get current domain from nginx config
    local current_domain=""
    if [ -f "$NGINX_CONFIG" ]; then
        current_domain=$(grep "server_name" "$NGINX_CONFIG" | head -1 | awk '{print $2}' | sed 's/;//')
    fi
    
    # Get new domain from user
    if [ -z "$1" ]; then
        echo "Enter the new domain name (e.g., myapp.example.com):"
        read -p "Domain: " new_domain
    else
        new_domain="$1"
    fi
    
    # Validate domain format
    if ! validate_domain "$new_domain"; then
        error "Invalid domain format: $new_domain"
        exit 1
    fi
    
    # Get server IP
    local server_ip=$(get_server_ip)
    info "Server IP: $server_ip"
    
    # Check if domain is the same as current
    if [ "$new_domain" = "$current_domain" ]; then
        info "Domain is already configured as $new_domain"
        
        # Check DNS resolution
        if check_dns "$new_domain" "$server_ip"; then
            success "Domain is properly configured and DNS is working"
            test_domain "$new_domain"
        else
            show_dns_instructions "$new_domain" "$server_ip"
        fi
        exit 0
    fi
    
    # Update configurations
    log "🔄 Updating domain from '$current_domain' to '$new_domain'..."
    
    # Update nginx configuration
    if update_nginx_config "$new_domain" "$current_domain"; then
        # Update environment file
        update_env_file "$new_domain" "$current_domain"
        
        success "Domain configuration updated successfully"
        
        # Show DNS instructions
        show_dns_instructions "$new_domain" "$server_ip"
        
        # Show next steps
        echo ""
        info "📋 Next Steps:"
        echo "1. Configure DNS records as shown above"
        echo "2. Wait for DNS propagation (check with: nslookup $new_domain)"
        echo "3. Test domain: curl -I http://$new_domain"
        echo "4. Setup SSL: $APP_NAME-manage ssl"
        echo "5. Restart services: $APP_NAME-manage restart"
        echo ""
        
    else
        error "Failed to update domain configuration"
        exit 1
    fi
}

# Show help if requested
if [ "$1" = "--help" ] || [ "$1" = "-h" ]; then
    echo "Usage: $0 [domain]"
    echo ""
    echo "Examples:"
    echo "  $0                    # Interactive mode"
    echo "  $0 myapp.example.com  # Set domain directly"
    echo ""
    echo "This script will:"
    echo "  - Update Nginx configuration"
    echo "  - Update environment file"
    echo "  - Show DNS configuration instructions"
    echo "  - Test domain configuration"
    exit 0
fi

# Run main function
main "$@"
