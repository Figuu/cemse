#!/bin/bash

# CEMSE Production Setup Script for Amazon Linux EC2
# This script configures nginx, creates a systemd service, and prepares for custom domain

set -e  # Exit on any error

# Configuration variables - CHANGE THESE AS NEEDED
DOMAIN="cemse.boring.lat"
PROJECT_PATH="/opt/cemse"
PROJECT_USER="ec2-user"
NGINX_PORT="80"
APP_PORT="3000"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging function
log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')] $1${NC}"
}

error() {
    echo -e "${RED}[ERROR] $1${NC}"
    exit 1
}

warning() {
    echo -e "${YELLOW}[WARNING] $1${NC}"
}

info() {
    echo -e "${BLUE}[INFO] $1${NC}"
}

# Check if running as root
if [ "$EUID" -ne 0 ]; then
    error "Please run this script as root (use sudo)"
fi

# Check if project directory exists
if [ ! -d "$PROJECT_PATH" ]; then
    error "Project directory $PROJECT_PATH does not exist. Please ensure your project is deployed there."
fi

log "Starting CEMSE production setup..."
log "Domain: $DOMAIN"
log "Project Path: $PROJECT_PATH"
log "App Port: $APP_PORT"

# Update system packages
log "Updating system packages..."
yum update -y

# Install required packages
log "Installing required packages..."
yum install -y nginx nodejs npm git

# Install pnpm globally
log "Installing pnpm..."
npm install -g pnpm

# Configure firewall
log "Configuring firewall..."
systemctl start firewalld
systemctl enable firewalld
firewall-cmd --permanent --add-service=http
firewall-cmd --permanent --add-service=https
firewall-cmd --permanent --add-port=3000/tcp
firewall-cmd --reload

# Create nginx configuration
log "Creating nginx configuration..."
cat > /etc/nginx/conf.d/cemse.conf << EOF
# CEMSE Application Configuration
server {
    listen 80;
    server_name $DOMAIN;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_proxied expired no-cache no-store private must-revalidate auth;
    gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml+rss application/javascript;

    # Client max body size (for file uploads)
    client_max_body_size 100M;

    # Proxy settings
    location / {
        proxy_pass http://127.0.0.1:$APP_PORT;
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
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
        proxy_pass http://127.0.0.1:$APP_PORT;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Health check endpoint
    location /health {
        access_log off;
        return 200 "healthy\n";
        add_header Content-Type text/plain;
    }
}

# Redirect www to non-www
server {
    listen 80;
    server_name www.$DOMAIN;
    return 301 http://$DOMAIN\$request_uri;
}
EOF

# Create systemd service for the application
log "Creating systemd service..."
cat > /etc/systemd/system/cemse.service << EOF
[Unit]
Description=CEMSE Next.js Application
After=network.target

[Service]
Type=simple
User=$PROJECT_USER
WorkingDirectory=$PROJECT_PATH
Environment=NODE_ENV=production
Environment=PORT=$APP_PORT
ExecStart=/usr/bin/pnpm run start
Restart=always
RestartSec=10
StandardOutput=syslog
StandardError=syslog
SyslogIdentifier=cemse

# Security settings
NoNewPrivileges=yes
PrivateTmp=yes
ProtectSystem=strict
ProtectHome=yes
ReadWritePaths=$PROJECT_PATH

[Install]
WantedBy=multi-user.target
EOF

# Set proper permissions
log "Setting permissions..."
chown -R $PROJECT_USER:$PROJECT_USER $PROJECT_PATH
chmod +x $PROJECT_PATH

# Install project dependencies
log "Installing project dependencies..."
cd $PROJECT_PATH
sudo -u $PROJECT_USER pnpm install

# Build the application
log "Building the application..."
sudo -u $PROJECT_USER pnpm run build

# Reload systemd and start services
log "Starting services..."
systemctl daemon-reload
systemctl enable nginx
systemctl enable cemse
systemctl start nginx
systemctl start cemse

# Check service status
log "Checking service status..."
sleep 5

if systemctl is-active --quiet nginx; then
    log "✅ Nginx is running"
else
    error "❌ Nginx failed to start"
fi

if systemctl is-active --quiet cemse; then
    log "✅ CEMSE service is running"
else
    warning "❌ CEMSE service failed to start, checking logs..."
    journalctl -u cemse -n 20 --no-pager
fi

# SSL Certificate setup instructions
log "SSL Certificate Setup Instructions:"
echo ""
info "To enable HTTPS, you have several options:"
info "1. Let's Encrypt (Recommended - Free):"
info "   sudo yum install -y certbot python3-certbot-nginx"
info "   sudo certbot --nginx -d $DOMAIN -d www.$DOMAIN"
info ""
info "2. AWS Certificate Manager (if using CloudFront):"
info "   - Request certificate in AWS Console"
info "   - Validate domain ownership"
info "   - Configure CloudFront distribution"
info ""
info "3. Custom SSL Certificate:"
info "   - Place certificates in /etc/ssl/certs/"
info "   - Update nginx configuration with SSL settings"

# Domain DNS setup instructions
log "Domain DNS Setup Instructions:"
echo ""
info "To complete the setup, configure your domain DNS:"
info "1. Point $DOMAIN A record to your EC2 instance IP: $(curl -s http://checkip.amazonaws.com)"
info "2. Point www.$DOMAIN A record to your EC2 instance IP: $(curl -s http://checkip.amazonaws.com)"
info "3. Wait for DNS propagation (can take up to 48 hours)"
info ""
info "To check if your domain is properly configured:"
info "nslookup $DOMAIN"

# Create management script
log "Creating management script..."
cat > /usr/local/bin/cemse-manage << 'EOF'
#!/bin/bash

case "$1" in
    start)
        sudo systemctl start cemse
        sudo systemctl start nginx
        echo "✅ Services started"
        ;;
    stop)
        sudo systemctl stop cemse
        sudo systemctl stop nginx
        echo "✅ Services stopped"
        ;;
    restart)
        sudo systemctl restart cemse
        sudo systemctl restart nginx
        echo "✅ Services restarted"
        ;;
    status)
        echo "=== CEMSE Service Status ==="
        sudo systemctl status cemse --no-pager
        echo ""
        echo "=== Nginx Status ==="
        sudo systemctl status nginx --no-pager
        ;;
    logs)
        sudo journalctl -u cemse -f
        ;;
    update)
        cd /opt/cemse
        sudo -u ec2-user git pull
        sudo -u ec2-user pnpm install
        sudo -u ec2-user pnpm run build
        sudo systemctl restart cemse
        echo "✅ Application updated and restarted"
        ;;
    ssl)
        echo "Setting up SSL certificate..."
        sudo certbot --nginx -d cemse.boring.lat -d www.cemse.boring.lat
        ;;
    *)
        echo "Usage: $0 {start|stop|restart|status|logs|update|ssl}"
        echo ""
        echo "Commands:"
        echo "  start   - Start all services"
        echo "  stop    - Stop all services"
        echo "  restart - Restart all services"
        echo "  status  - Show service status"
        echo "  logs    - Show application logs"
        echo "  update  - Pull latest code and restart"
        echo "  ssl     - Setup SSL certificate"
        exit 1
        ;;
esac
EOF

chmod +x /usr/local/bin/cemse-manage

# Create log rotation configuration
log "Setting up log rotation..."
cat > /etc/logrotate.d/cemse << EOF
/var/log/nginx/*.log {
    daily
    missingok
    rotate 52
    compress
    delaycompress
    notifempty
    create 640 nginx adm
    sharedscripts
    postrotate
        if [ -f /var/run/nginx.pid ]; then
            kill -USR1 \$(cat /var/run/nginx.pid)
        fi
    endscript
}
EOF

# Final status check
log "Final status check..."
echo ""
info "=== Installation Summary ==="
info "Domain: $DOMAIN"
info "Project Path: $PROJECT_PATH"
info "App Port: $APP_PORT"
info "Management Command: cemse-manage"
echo ""

# Test nginx configuration
if nginx -t; then
    log "✅ Nginx configuration is valid"
else
    error "❌ Nginx configuration has errors"
fi

# Show current status
log "Current service status:"
systemctl status nginx --no-pager -l
echo ""
systemctl status cemse --no-pager -l

echo ""
log "🎉 Setup completed successfully!"
echo ""
info "Next steps:"
info "1. Configure your domain DNS to point to this server"
info "2. Wait for DNS propagation"
info "3. Run 'cemse-manage ssl' to setup HTTPS"
info "4. Access your application at http://$DOMAIN"
echo ""
info "Useful commands:"
info "- Check status: cemse-manage status"
info "- View logs: cemse-manage logs"
info "- Restart services: cemse-manage restart"
info "- Update application: cemse-manage update"
echo ""
info "Your application should now be accessible at:"
info "http://$DOMAIN (once DNS is configured)"
info "http://$(curl -s http://checkip.amazonaws.com) (direct IP access)"
