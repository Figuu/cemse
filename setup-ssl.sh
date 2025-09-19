#!/bin/bash

# =============================================================================
# CEMSE SSL Certificate Setup Script for Ubuntu Server 24.04 LTS
# =============================================================================
# This script sets up SSL certificates using Let's Encrypt for the CEMSE application
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

# Function to check if running as root
check_root() {
    if [ "$EUID" -ne 0 ]; then
        error "This script must be run as root (use sudo)"
        exit 1
    fi
}

# Function to check if certbot is installed
check_certbot() {
    if ! command -v certbot &> /dev/null; then
        error "Certbot is not installed. Please run the setup script first."
        exit 1
    fi
    success "Certbot is installed"
}

# Function to get domain from nginx config
get_domain() {
    if [ -f "$NGINX_CONFIG" ]; then
        local domain=$(grep "server_name" "$NGINX_CONFIG" | head -1 | awk '{print $2}' | sed 's/;//' | sed 's/www\.//')
        echo "$domain"
    else
        error "Nginx configuration not found at $NGINX_CONFIG"
        exit 1
    fi
}

# Function to check DNS resolution
check_dns() {
    local domain="$1"
    
    log "🔍 Checking DNS resolution for $domain..."
    
    # Check if domain resolves
    if ! nslookup "$domain" > /dev/null 2>&1; then
        error "Domain $domain does not resolve. Please configure DNS first."
        exit 1
    fi
    
    # Get resolved IP
    local resolved_ip=$(nslookup "$domain" | grep -A 1 "Name:" | tail -1 | awk '{print $2}')
    local server_ip=$(curl -s http://checkip.amazonaws.com 2>/dev/null || hostname -I | awk '{print $1}')
    
    if [ "$resolved_ip" = "$server_ip" ]; then
        success "DNS is correctly configured ($domain -> $resolved_ip)"
        return 0
    else
        error "DNS mismatch: $domain resolves to $resolved_ip, but server IP is $server_ip"
        error "Please update your DNS records to point to this server"
        exit 1
    fi
}

# Function to check if HTTP is accessible
check_http_access() {
    local domain="$1"
    
    log "🌐 Checking HTTP access for $domain..."
    
    if curl -f -s "http://$domain" > /dev/null 2>&1; then
        success "HTTP access is working for $domain"
        return 0
    else
        error "HTTP access is not working for $domain"
        error "Please ensure:"
        error "1. Nginx is running: sudo systemctl status nginx"
        error "2. Domain is properly configured"
        error "3. Firewall allows HTTP traffic"
        exit 1
    fi
}

# Function to backup nginx configuration
backup_nginx_config() {
    log "💾 Backing up Nginx configuration..."
    
    local backup_file="$NGINX_CONFIG.backup.$(date +%Y%m%d_%H%M%S)"
    cp "$NGINX_CONFIG" "$backup_file"
    success "Nginx configuration backed up to $backup_file"
}

# Function to update nginx configuration for SSL
update_nginx_ssl() {
    local domain="$1"
    
    log "🔧 Updating Nginx configuration for SSL..."
    
    # Create new nginx configuration with SSL
    cat > "$NGINX_CONFIG" << EOF
# $APP_NAME Application Configuration
server {
    listen 80;
    server_name $domain www.$domain;
    
    # Redirect all HTTP traffic to HTTPS
    return 301 https://\$server_name\$request_uri;
}

server {
    listen 443 ssl http2;
    server_name $domain www.$domain;
    
    # SSL configuration (will be updated by certbot)
    ssl_certificate /etc/letsencrypt/live/$domain/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/$domain/privkey.pem;
    
    # SSL security settings
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512:ECDHE-RSA-AES256-GCM-SHA384:DHE-RSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-SHA384;
    ssl_prefer_server_ciphers off;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;
    
    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    
    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_proxied expired no-cache no-store private auth;
    gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml+rss application/javascript application/json;
    
    # Client max body size (for file uploads)
    client_max_body_size 100M;
    
    # Proxy settings
    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
        proxy_read_timeout 86400;
        proxy_send_timeout 86400;
    }
    
    # Static files caching
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        proxy_pass http://127.0.0.1:3000;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
    
    # Health check endpoint
    location /health {
        access_log off;
        return 200 "healthy\n";
        add_header Content-Type text/plain;
    }
    
    # Logs
    access_log /var/log/nginx/${APP_NAME}_access.log;
    error_log /var/log/nginx/${APP_NAME}_error.log;
}
EOF

    # Test nginx configuration
    if nginx -t; then
        success "Nginx configuration updated for SSL"
        systemctl reload nginx
    else
        error "Nginx configuration test failed"
        exit 1
    fi
}

# Function to obtain SSL certificate
obtain_ssl_certificate() {
    local domain="$1"
    
    log "🔒 Obtaining SSL certificate for $domain..."
    
    # Run certbot to obtain certificate
    if certbot --nginx -d "$domain" -d "www.$domain" --non-interactive --agree-tos --email "admin@$domain" --redirect; then
        success "SSL certificate obtained successfully"
        return 0
    else
        error "Failed to obtain SSL certificate"
        return 1
    fi
}

# Function to setup automatic renewal
setup_auto_renewal() {
    log "🔄 Setting up automatic SSL certificate renewal..."
    
    # Create renewal script
    cat > /etc/cron.d/certbot-renew << EOF
# Renew Let's Encrypt certificates twice daily
0 12 * * * root certbot renew --quiet --post-hook "systemctl reload nginx"
0 0 * * * root certbot renew --quiet --post-hook "systemctl reload nginx"
EOF

    # Test renewal
    if certbot renew --dry-run; then
        success "Automatic renewal configured and tested"
    else
        warn "Automatic renewal test failed, but renewal is configured"
    fi
}

# Function to test SSL configuration
test_ssl() {
    local domain="$1"
    
    log "🧪 Testing SSL configuration..."
    
    # Test HTTPS access
    if curl -f -s "https://$domain" > /dev/null 2>&1; then
        success "HTTPS access is working for $domain"
    else
        error "HTTPS access is not working for $domain"
        return 1
    fi
    
    # Test SSL certificate
    if openssl s_client -connect "$domain:443" -servername "$domain" < /dev/null 2>/dev/null | grep -q "Verify return code: 0"; then
        success "SSL certificate is valid"
    else
        warn "SSL certificate validation failed"
    fi
    
    # Test HTTP redirect
    if curl -I "http://$domain" 2>/dev/null | grep -q "301\|302"; then
        success "HTTP to HTTPS redirect is working"
    else
        warn "HTTP to HTTPS redirect may not be working"
    fi
}

# Function to show SSL information
show_ssl_info() {
    local domain="$1"
    
    echo ""
    echo "========================================="
    echo "🔒 SSL Configuration Complete!"
    echo "========================================="
    echo ""
    success "SSL certificate has been successfully configured!"
    echo ""
    info "🌐 Access Information:"
    echo "   - HTTPS: https://$domain"
    echo "   - HTTP: http://$domain (redirects to HTTPS)"
    echo ""
    info "📋 Certificate Details:"
    echo "   - Issuer: Let's Encrypt"
    echo "   - Expires: $(openssl x509 -in /etc/letsencrypt/live/$domain/cert.pem -noout -dates | grep notAfter | cut -d= -f2)"
    echo "   - Auto-renewal: Configured"
    echo ""
    info "🔧 Management Commands:"
    echo "   - Check certificate: sudo certbot certificates"
    echo "   - Renew certificate: sudo certbot renew"
    echo "   - Test renewal: sudo certbot renew --dry-run"
    echo ""
    info "🧪 Test SSL:"
    echo "   - SSL Labs: https://www.ssllabs.com/ssltest/analyze.html?d=$domain"
    echo "   - SSL Check: https://www.sslshopper.com/ssl-checker.html#hostname=$domain"
    echo ""
}

# Function to check existing SSL certificate
check_existing_ssl() {
    local domain="$1"
    
    if [ -f "/etc/letsencrypt/live/$domain/fullchain.pem" ]; then
        info "SSL certificate already exists for $domain"
        
        # Check if certificate is valid
        if openssl x509 -in "/etc/letsencrypt/live/$domain/cert.pem" -noout -checkend 86400; then
            success "SSL certificate is valid and not expiring soon"
            return 0
        else
            warn "SSL certificate is expiring soon or invalid"
            return 1
        fi
    else
        return 1
    fi
}

# Main function
main() {
    echo ""
    echo "========================================="
    echo "🔒 $APP_NAME SSL Certificate Setup"
    echo "========================================="
    echo ""
    
    # Check if running as root
    check_root
    
    # Check if certbot is installed
    check_certbot
    
    # Get domain from nginx config
    local domain=$(get_domain)
    info "Domain: $domain"
    
    # Check if SSL certificate already exists
    if check_existing_ssl "$domain"; then
        info "SSL certificate already exists and is valid"
        
        read -p "Do you want to renew it anyway? (y/N): " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            info "SSL setup skipped"
            exit 0
        fi
    fi
    
    # Check DNS resolution
    check_dns "$domain"
    
    # Check HTTP access
    check_http_access "$domain"
    
    # Backup nginx configuration
    backup_nginx_config
    
    # Update nginx configuration for SSL
    update_nginx_ssl "$domain"
    
    # Obtain SSL certificate
    if obtain_ssl_certificate "$domain"; then
        # Setup automatic renewal
        setup_auto_renewal
        
        # Test SSL configuration
        test_ssl "$domain"
        
        # Show SSL information
        show_ssl_info "$domain"
        
        success "SSL setup completed successfully!"
    else
        error "SSL setup failed"
        exit 1
    fi
}

# Show help if requested
if [ "$1" = "--help" ] || [ "$1" = "-h" ]; then
    echo "Usage: $0"
    echo ""
    echo "This script will:"
    echo "  - Check DNS resolution"
    echo "  - Verify HTTP access"
    echo "  - Update Nginx configuration for SSL"
    echo "  - Obtain Let's Encrypt SSL certificate"
    echo "  - Setup automatic renewal"
    echo "  - Test SSL configuration"
    echo ""
    echo "Prerequisites:"
    echo "  - Domain must be configured and pointing to this server"
    echo "  - HTTP access must be working"
    echo "  - Certbot must be installed"
    echo ""
    exit 0
fi

# Run main function
main "$@"
