#!/bin/bash

# =============================================================================
# Emplea y Emprende Application Setup Script for Ubuntu Server 24.04 LTS
# =============================================================================
# This script prepares an Ubuntu Server 24.04 LTS instance for deploying the Emplea y Emprende 
# application with all required dependencies, services, and configurations.
# =============================================================================

set -e  # Exit on any error

# Configuration variables - CHANGE THESE AS NEEDED
APP_NAME="emplea-y-emprende"
APP_USER="ubuntu"
APP_DOMAIN="empleayemprende.boring.lat"
APP_PATH="/opt/$APP_NAME"
APP_PORT="3000"
GIT_REPO="https://github.com/figuu/emplea-y-emprende.git"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
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

# Check if running as root
if [[ $EUID -eq 0 ]]; then
    error "This script should not be run as root. Please run as a regular user with sudo privileges."
    exit 1
fi

# Check if user has sudo privileges
if ! sudo -n true 2>/dev/null; then
    error "This script requires sudo privileges. Please ensure your user has sudo access."
    exit 1
fi

# Check Ubuntu version
if ! lsb_release -d | grep -q "Ubuntu 24.04"; then
    warn "This script is designed for Ubuntu 24.04 LTS. Current system:"
    lsb_release -d
    read -p "Continue anyway? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

log "🚀 Starting Emplea y Emprende application setup for Ubuntu 24.04 LTS..."
log "App Name: $APP_NAME"
log "Domain: $APP_DOMAIN"
log "Path: $APP_PATH"
log "User: $APP_USER"

# =============================================================================
# 1. SYSTEM UPDATE AND BASIC TOOLS
# =============================================================================
log "📦 Updating system packages..."

# Update and upgrade with error handling
log "📋 Updating package lists..."
sudo apt update || warn "Package update had some issues, continuing..."

log "⬆️ Upgrading packages..."
sudo apt upgrade -y || {
    warn "Some packages failed to upgrade, fixing and continuing..."
    sudo apt --fix-broken install -y
    sudo apt upgrade -y || warn "Some packages still failing, continuing with setup..."
}

log "🔧 Installing basic development tools..."
sudo apt install -y \
    curl \
    wget \
    git \
    unzip \
    ca-certificates \
    gnupg \
    lsb-release \
    software-properties-common \
    apt-transport-https \
    build-essential \
    python3 \
    python3-pip \
    htop \
    nano \
    vim \
    tree \
    jq \
    openssl \
    libssl-dev \
    pkg-config \
    libffi-dev \
    libbz2-dev \
    libreadline-dev \
    libsqlite3-dev \
    libncurses5-dev \
    libncursesw5-dev \
    xz-utils \
    tk-dev \
    libxml2-dev \
    libxmlsec1-dev \
    liblzma-dev || {
    warn "Some packages failed to install, fixing and continuing..."
    sudo apt --fix-broken install -y
}

# =============================================================================
# 2. NODE.JS AND PNPM INSTALLATION
# =============================================================================
log "📦 Installing Node.js 20 LTS..."
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

log "📦 Installing pnpm package manager..."
curl -fsSL https://get.pnpm.io/install.sh | sh -
source ~/.bashrc

# Add pnpm to PATH for current session
export PATH="$HOME/.local/share/pnpm:$PATH"

# Install pnpm globally via npm if the curl method didn't work
if ! command -v pnpm &> /dev/null; then
    warn "pnpm not found, installing via npm..."
    sudo npm install -g pnpm
fi

success "Node.js version: $(node --version)"
success "NPM version: $(npm --version)"
success "pnpm version: $(pnpm --version)"

# =============================================================================
# 3. DOCKER INSTALLATION
# =============================================================================
log "🐳 Installing Docker..."
# Remove old versions if they exist
sudo apt remove -y docker docker-engine docker.io containerd runc 2>/dev/null || true

# Add Docker's official GPG key
sudo install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
sudo chmod a+r /etc/apt/keyrings/docker.gpg

# Add Docker repository
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
  $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | \
  sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# Install Docker
sudo apt update
sudo apt install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

# Start and enable Docker service
sudo systemctl start docker
sudo systemctl enable docker

# Add current user to docker group
sudo usermod -aG docker $USER

success "Docker version: $(docker --version)"

# =============================================================================
# 4. DOCKER COMPOSE INSTALLATION
# =============================================================================
log "🐳 Installing Docker Compose standalone..."
# Get latest version of Docker Compose
DOCKER_COMPOSE_VERSION=$(curl -s https://api.github.com/repos/docker/compose/releases/latest | jq -r .tag_name)
sudo curl -L "https://github.com/docker/compose/releases/download/${DOCKER_COMPOSE_VERSION}/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

success "Docker Compose version: $(docker-compose --version)"

# =============================================================================
# 5. FFMPEG INSTALLATION (for video processing)
# =============================================================================
log "🎥 Installing FFmpeg for video processing..."
sudo apt install -y ffmpeg

success "FFmpeg version: $(ffmpeg -version | head -1)"

# =============================================================================
# 6. POSTGRESQL CLIENT TOOLS
# =============================================================================
log "🗄️ Installing PostgreSQL client tools..."
sudo apt install -y postgresql-client

success "PostgreSQL client version: $(psql --version)"

# =============================================================================
# 7. REDIS CLIENT TOOLS
# =============================================================================
log "🔴 Installing Redis client tools..."
sudo apt install -y redis-tools

success "Redis CLI version: $(redis-cli --version)"

# =============================================================================
# 8. NGINX INSTALLATION
# =============================================================================
log "🌐 Installing Nginx..."
sudo apt install -y nginx

# Start and enable Nginx
sudo systemctl start nginx
sudo systemctl enable nginx

success "Nginx version: $(nginx -v 2>&1)"

# =============================================================================
# 9. SSL CERTIFICATE TOOLS (Let's Encrypt)
# =============================================================================
log "🔒 Installing Certbot for SSL certificates..."
sudo apt install -y certbot python3-certbot-nginx

success "Certbot version: $(certbot --version)"

# =============================================================================
# 10. FIREWALL CONFIGURATION
# =============================================================================
log "🔥 Configuring UFW firewall..."

# Enable UFW
sudo ufw --force enable

# Allow SSH (usually already enabled)
sudo ufw allow ssh

# Allow HTTP and HTTPS
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# Allow Next.js application port (for direct access if needed)
sudo ufw allow $APP_PORT/tcp

# Allow PostgreSQL (only from localhost for security)
sudo ufw allow from 127.0.0.1 to any port 5432

# Allow Redis (only from localhost for security)
sudo ufw allow from 127.0.0.1 to any port 6379

# Allow MinIO (only from localhost for security)
sudo ufw allow from 127.0.0.1 to any port 9000
sudo ufw allow from 127.0.0.1 to any port 9001

success "Firewall configured"

# =============================================================================
# 11. CLONE REPOSITORY TO /opt/emplea-y-emprende
# =============================================================================
log "📥 Cloning repository..."

# Remove directory if it exists to avoid conflicts
if [ -d "$APP_PATH" ]; then
    warn "Directory $APP_PATH already exists, removing it..."
    sudo rm -rf $APP_PATH
fi

# Clone directly to /opt/emplea-y-emprende (git will create the directory)
cd /opt
sudo git clone $GIT_REPO emplea-y-emprende

# Set proper ownership
sudo chown -R $USER:$USER $APP_PATH

# Create additional directories
log "📁 Creating additional directories..."

# Create logs directory
sudo mkdir -p /var/log/$APP_NAME
sudo chown $USER:$USER /var/log/$APP_NAME

# Create uploads directory if it doesn't exist
sudo mkdir -p $APP_PATH/public/uploads
sudo chown -R $USER:$USER $APP_PATH/public

success "Repository cloned and directories created"

# =============================================================================
# 13. ENVIRONMENT CONFIGURATION
# =============================================================================
log "⚙️ Setting up environment configuration..."

# Create environment file if it doesn't exist
if [ ! -f "$APP_PATH/.env" ]; then
    if [ -f "$APP_PATH/.env.example" ]; then
        cp $APP_PATH/.env.example $APP_PATH/.env
        info "Created .env file from .env.example"
        warn "Please edit $APP_PATH/.env with your actual configuration values"
    else
        # Create basic environment file
        cat > $APP_PATH/.env << EOF
# Database Configuration
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/${APP_NAME}_prod"
DIRECT_URL="postgresql://postgres:postgres@localhost:5432/${APP_NAME}_prod"

# Application Configuration
NODE_ENV="production"
PORT=$APP_PORT
NEXT_PUBLIC_APP_URL="https://$APP_DOMAIN"

# Redis Configuration
REDIS_URL="redis://localhost:6379"

# MinIO Configuration
MINIO_ENDPOINT="localhost"
MINIO_PORT=9000
MINIO_ACCESS_KEY="your-minio-access-key"
MINIO_SECRET_KEY="your-minio-secret-key"
MINIO_USE_SSL=false
MINIO_BASE_URL="http://localhost:9000"

# JWT Configuration
JWT_SECRET="your-super-secret-jwt-key-here"

# Supabase Configuration (if using Supabase)
NEXT_PUBLIC_SUPABASE_URL="your-supabase-url"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-supabase-anon-key"
SUPABASE_SERVICE_ROLE_KEY="your-supabase-service-role-key"
EOF
        info "Created basic .env file"
        warn "Please edit $APP_PATH/.env with your actual configuration values"
    fi
fi

# =============================================================================
# 14. NGINX CONFIGURATION
# =============================================================================
log "🌐 Creating Nginx configuration..."

sudo tee /etc/nginx/sites-available/$APP_NAME > /dev/null << EOF
# $APP_NAME Application Configuration
server {
    listen 80;
    server_name $APP_DOMAIN www.$APP_DOMAIN;
    
    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    # Note: CSP is handled by Next.js application headers
    
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
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
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
    
    # Logs
    access_log /var/log/nginx/${APP_NAME}_access.log;
    error_log /var/log/nginx/${APP_NAME}_error.log;
}

# Redirect www to non-www
server {
    listen 80;
    server_name www.$APP_DOMAIN;
    return 301 http://$APP_DOMAIN\$request_uri;
}
EOF

# Enable the site
sudo ln -sf /etc/nginx/sites-available/$APP_NAME /etc/nginx/sites-enabled/

# Remove default site
sudo rm -f /etc/nginx/sites-enabled/default

# Test nginx configuration
sudo nginx -t

# Restart Nginx
sudo systemctl restart nginx

success "Nginx configuration created and enabled"

# =============================================================================
# 15. SYSTEMD SERVICE CONFIGURATION
# =============================================================================
log "🔧 Creating systemd service..."

sudo tee /etc/systemd/system/$APP_NAME.service > /dev/null << EOF
[Unit]
Description=$APP_NAME Next.js Application
After=network.target
Requires=$APP_NAME-backend.service
After=$APP_NAME-backend.service

[Service]
Type=simple
User=$USER
Group=$USER
WorkingDirectory=$APP_PATH
Environment=NODE_ENV=production
Environment=PATH=/usr/local/bin:/usr/bin:/bin:\$HOME/.local/share/pnpm:\$HOME/.nvm/versions/node/v20.*/bin
ExecStart=/usr/bin/pnpm start
ExecStop=/bin/kill -TERM \$MAINPID
TimeoutStartSec=60
TimeoutStopSec=30
Restart=always
RestartSec=10
StandardOutput=journal
StandardError=journal

[Install]
WantedBy=multi-user.target
EOF

# Create backend startup service
sudo tee /etc/systemd/system/$APP_NAME-backend.service > /dev/null << EOF
[Unit]
Description=$APP_NAME Backend Services (Docker)
After=docker.service
Requires=docker.service

[Service]
Type=oneshot
RemainAfterExit=yes
User=$USER
Group=$USER
WorkingDirectory=$APP_PATH
ExecStart=/usr/local/bin/docker-compose up -d
ExecStop=/usr/local/bin/docker-compose down
TimeoutStartSec=60

[Install]
WantedBy=multi-user.target
EOF

# Reload systemd
sudo systemctl daemon-reload

# Enable services to start on boot
sudo systemctl enable $APP_NAME-backend
sudo systemctl enable $APP_NAME

success "Systemd services created and enabled for auto-start"

# =============================================================================
# 16. LOG ROTATION CONFIGURATION
# =============================================================================
log "📝 Setting up log rotation..."

sudo tee /etc/logrotate.d/$APP_NAME > /dev/null << EOF
/var/log/$APP_NAME/*.log {
    daily
    missingok
    rotate 30
    compress
    delaycompress
    notifempty
    create 0644 $USER $USER
    postrotate
        systemctl reload $APP_NAME || true
    endscript
}

/var/log/nginx/${APP_NAME}_*.log {
    daily
    missingok
    rotate 52
    compress
    delaycompress
    notifempty
    create 0644 nginx nginx
    postrotate
        systemctl reload nginx || true
    endscript
}
EOF

success "Log rotation configured"

# =============================================================================
# 17. CREATE MANAGEMENT SCRIPTS
# =============================================================================
log "📜 Creating management scripts..."

# Main management script
sudo tee /usr/local/bin/$APP_NAME-manage > /dev/null << EOF
#!/bin/bash

APP_NAME="$APP_NAME"
APP_PATH="$APP_PATH"
APP_DOMAIN="$APP_DOMAIN"
APP_PORT="$APP_PORT"

case "\$1" in
    start)
        sudo systemctl start \$APP_NAME
        sudo systemctl start nginx
        echo "✅ Services started"
        ;;
    stop)
        sudo systemctl stop \$APP_NAME
        sudo systemctl stop nginx
        echo "✅ Services stopped"
        ;;
    restart)
        sudo systemctl restart \$APP_NAME
        sudo systemctl restart nginx
        echo "✅ Services restarted"
        ;;
    status)
        echo "=== \$APP_NAME Service Status ==="
        sudo systemctl status \$APP_NAME --no-pager
        echo ""
        echo "=== Nginx Status ==="
        sudo systemctl status nginx --no-pager
        echo ""
        echo "=== Docker Containers ==="
        docker-compose -f \$APP_PATH/docker-compose.yml ps
        ;;
    logs)
        sudo journalctl -u \$APP_NAME -f
        ;;
    deploy)
        cd \$APP_PATH
        ./deploy.sh
        ;;
    update)
        cd \$APP_PATH
        git pull
        ./deploy.sh
        ;;
    ssl)
        echo "Setting up SSL certificate..."
        sudo certbot --nginx -d \$APP_DOMAIN -d www.\$APP_DOMAIN
        ;;
    backup)
        cd \$APP_PATH
        ./backup.sh
        ;;
    health)
        cd \$APP_PATH
        ./health-check.sh
        ;;
    *)
        echo "Usage: \$0 {start|stop|restart|status|logs|deploy|update|ssl|backup|health}"
        echo ""
        echo "Commands:"
        echo "  start   - Start all services"
        echo "  stop    - Stop all services"
        echo "  restart - Restart all services"
        echo "  status  - Show service status"
        echo "  logs    - Show application logs"
        echo "  deploy  - Run deployment script"
        echo "  update  - Pull latest code and deploy"
        echo "  ssl     - Setup SSL certificate"
        echo "  backup  - Create backup"
        echo "  health  - Check application health"
        exit 1
        ;;
esac
EOF

sudo chmod +x /usr/local/bin/$APP_NAME-manage

# Domain configuration script
sudo tee /usr/local/bin/$APP_NAME-domain > /dev/null << EOF
#!/bin/bash

APP_NAME="$APP_NAME"
APP_DOMAIN="$APP_DOMAIN"

if [ "\$1" = "" ]; then
    echo "Usage: \$APP_NAME-domain <new-domain>"
    echo "Example: \$APP_NAME-domain myapp.example.com"
    exit 1
fi

NEW_DOMAIN="\$1"
OLD_DOMAIN="$APP_DOMAIN"

echo "🔄 Updating domain from \$OLD_DOMAIN to \$NEW_DOMAIN..."

# Update nginx configuration
sudo sed -i "s/\$OLD_DOMAIN/\$NEW_DOMAIN/g" /etc/nginx/sites-available/\$APP_NAME

# Test nginx configuration
if sudo nginx -t; then
    sudo systemctl reload nginx
    echo "✅ Nginx configuration updated"
else
    echo "❌ Nginx configuration error, reverting..."
    sudo sed -i "s/\$NEW_DOMAIN/\$OLD_DOMAIN/g" /etc/nginx/sites-available/\$APP_NAME
    exit 1
fi

# Update environment file
if [ -f "$APP_PATH/.env" ]; then
    sed -i "s/\$OLD_DOMAIN/\$NEW_DOMAIN/g" $APP_PATH/.env
    echo "✅ Environment file updated"
fi

echo "✅ Domain updated to \$NEW_DOMAIN"
echo "📋 Next steps:"
echo "1. Update your DNS records to point \$NEW_DOMAIN to this server"
echo "2. Run: \$APP_NAME-manage ssl"
echo "3. Restart services: \$APP_NAME-manage restart"
EOF

sudo chmod +x /usr/local/bin/$APP_NAME-domain

success "Management scripts created"

# =============================================================================
# 18. SYSTEM OPTIMIZATION
# =============================================================================
log "⚡ Applying system optimizations..."

# Increase file descriptor limits
echo "* soft nofile 65536" | sudo tee -a /etc/security/limits.conf
echo "* hard nofile 65536" | sudo tee -a /etc/security/limits.conf
echo "root soft nofile 65536" | sudo tee -a /etc/security/limits.conf
echo "root hard nofile 65536" | sudo tee -a /etc/security/limits.conf

# Set kernel parameters for better performance
sudo tee -a /etc/sysctl.conf > /dev/null << EOF

# $APP_NAME Application Optimizations
vm.swappiness=1
net.core.somaxconn=1024
net.core.netdev_max_backlog=5000
net.core.rmem_default=262144
net.core.rmem_max=16777216
net.core.wmem_default=262144
net.core.wmem_max=16777216
net.ipv4.tcp_rmem=4096 87380 16777216
net.ipv4.tcp_wmem=4096 65536 16777216
net.ipv4.tcp_congestion_control=bbr
EOF

success "System optimizations applied"

# =============================================================================
# 19. FINAL SETUP
# =============================================================================
log "🎯 Final setup steps..."

# Start backend services first
log "🐳 Starting backend services..."
sudo systemctl start $APP_NAME-backend
sleep 10

# Install dependencies
log "📦 Installing application dependencies..."
cd $APP_PATH
pnpm install

# Generate Prisma client
log "🔧 Generating Prisma client..."
pnpm prisma generate

# Run database migrations and seed
log "🗄️ Setting up database..."
pnpm prisma migrate deploy

log "🌱 Seeding database..."
pnpm prisma db seed

# Build the application
log "🏗️ Building application..."
pnpm build

success "Application built and ready"

# =============================================================================
# 20. COMPLETION MESSAGE
# =============================================================================
echo ""
echo "========================================="
echo "🎉 $APP_NAME Setup Complete!"
echo "🐧 Ubuntu Server 24.04 LTS"
echo "========================================="
echo ""
success "Setup completed successfully!"
echo ""
info "📋 Next Steps:"
echo ""
echo "1. Configure your environment (optional):"
echo "   nano $APP_PATH/.env"
echo ""
echo "2. Start the Next.js application:"
echo "   sudo systemctl start $APP_NAME"
echo "   # Backend services are already running"
echo ""
echo "3. Check everything is working:"
echo "   ./manage.sh status"
echo "   # Application should be accessible at http://$(curl -s http://checkip.amazonaws.com):3000"
echo ""
echo "4. Configure domain (optional):"
echo "   ./manage.sh domain your-domain.com"
echo ""
echo "5. Setup SSL certificate (optional):"
echo "   ./manage.sh ssl"
echo ""
info "🔧 Management Commands:"
echo "   - Deploy: $APP_NAME-manage deploy"
echo "   - Status: $APP_NAME-manage status"
echo "   - Logs: $APP_NAME-manage logs"
echo "   - Restart: $APP_NAME-manage restart"
echo "   - SSL: $APP_NAME-manage ssl"
echo "   - Domain: $APP_NAME-domain <new-domain>"
echo ""
info "🌐 Access Information:"
echo "   - Application: http://$APP_DOMAIN (after DNS setup)"
echo "   - Direct IP: http://$(curl -s http://checkip.amazonaws.com)"
echo "   - MinIO: http://$(curl -s http://checkip.amazonaws.com):9000"
echo "   - MinIO Console: http://$(curl -s http://checkip.amazonaws.com):9001"
echo ""
warn "⚠️  IMPORTANT:"
echo "   - Please reboot the system to apply all changes"
echo "   - Update your .env file with actual configuration values"
echo "   - Configure DNS records for your domain"
echo "   - Run SSL setup after DNS propagation"
echo ""
warn "🔄 Please reboot your system now:"
warn "sudo reboot"
echo ""
