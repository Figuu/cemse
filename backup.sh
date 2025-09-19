#!/bin/bash

# =============================================================================
# CEMSE Backup Script for Ubuntu Server 24.04 LTS
# =============================================================================
# This script creates backups of the CEMSE application data
# =============================================================================

set -e  # Exit on any error

# Configuration
APP_NAME="cemse"
APP_PATH="/opt/$APP_NAME"
BACKUP_DIR="$APP_PATH/backups"
DATE=$(date +%Y%m%d_%H%M%S)
RETENTION_DAYS=30

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

# Function to create backup directory
create_backup_dir() {
    log "📁 Creating backup directory..."
    mkdir -p "$BACKUP_DIR"
    success "Backup directory created: $BACKUP_DIR"
}

# Function to backup database
backup_database() {
    log "🗄️ Backing up database..."
    
    # Check if database container is running
    if docker-compose ps db | grep -q "Up"; then
        # Create database backup
        docker-compose exec -T db pg_dump -U postgres -d cemse_prod > "$BACKUP_DIR/db_backup_$DATE.sql"
        
        # Compress database backup
        gzip "$BACKUP_DIR/db_backup_$DATE.sql"
        
        success "Database backup created: db_backup_$DATE.sql.gz"
    else
        warn "Database container not running, skipping database backup"
    fi
}

# Function to backup uploads
backup_uploads() {
    log "📁 Backing up uploads..."
    
    if [ -d "$APP_PATH/public/uploads" ]; then
        tar -czf "$BACKUP_DIR/uploads_backup_$DATE.tar.gz" -C "$APP_PATH" public/uploads/
        success "Uploads backup created: uploads_backup_$DATE.tar.gz"
    else
        warn "Uploads directory not found, skipping uploads backup"
    fi
}

# Function to backup MinIO data
backup_minio() {
    log "📦 Backing up MinIO data..."
    
    # Check if MinIO container is running
    if docker-compose ps minio | grep -q "Up"; then
        # Create MinIO data backup
        docker-compose exec -T minio tar -czf - /data > "$BACKUP_DIR/minio_backup_$DATE.tar.gz"
        success "MinIO backup created: minio_backup_$DATE.tar.gz"
    else
        warn "MinIO container not running, skipping MinIO backup"
    fi
}

# Function to backup configuration files
backup_config() {
    log "⚙️ Backing up configuration files..."
    
    # Create configuration backup directory
    mkdir -p "$BACKUP_DIR/config_$DATE"
    
    # Backup environment file
    if [ -f "$APP_PATH/.env" ]; then
        cp "$APP_PATH/.env" "$BACKUP_DIR/config_$DATE/.env"
    fi
    
    # Backup nginx configuration
    if [ -f "/etc/nginx/sites-available/$APP_NAME" ]; then
        cp "/etc/nginx/sites-available/$APP_NAME" "$BACKUP_DIR/config_$DATE/nginx.conf"
    fi
    
    # Backup systemd service
    if [ -f "/etc/systemd/system/$APP_NAME.service" ]; then
        cp "/etc/systemd/system/$APP_NAME.service" "$BACKUP_DIR/config_$DATE/service.conf"
    fi
    
    # Backup docker-compose file
    if [ -f "$APP_PATH/docker-compose.yml" ]; then
        cp "$APP_PATH/docker-compose.yml" "$BACKUP_DIR/config_$DATE/docker-compose.yml"
    fi
    
    # Compress configuration backup
    tar -czf "$BACKUP_DIR/config_backup_$DATE.tar.gz" -C "$BACKUP_DIR" "config_$DATE"
    rm -rf "$BACKUP_DIR/config_$DATE"
    
    success "Configuration backup created: config_backup_$DATE.tar.gz"
}

# Function to backup SSL certificates
backup_ssl() {
    log "🔒 Backing up SSL certificates..."
    
    # Get domain from nginx config
    if [ -f "/etc/nginx/sites-available/$APP_NAME" ]; then
        local domain=$(grep "server_name" "/etc/nginx/sites-available/$APP_NAME" | head -1 | awk '{print $2}' | sed 's/;//' | sed 's/www\.//')
        
        if [ -d "/etc/letsencrypt/live/$domain" ]; then
            # Create SSL backup
            tar -czf "$BACKUP_DIR/ssl_backup_$DATE.tar.gz" -C "/etc/letsencrypt" "live/$domain" "archive/$domain"
            success "SSL backup created: ssl_backup_$DATE.tar.gz"
        else
            info "No SSL certificates found for domain: $domain"
        fi
    else
        warn "Nginx configuration not found, skipping SSL backup"
    fi
}

# Function to create backup manifest
create_manifest() {
    log "📋 Creating backup manifest..."
    
    cat > "$BACKUP_DIR/backup_manifest_$DATE.txt" << EOF
CEMSE Application Backup Manifest
================================
Date: $(date)
Backup ID: $DATE
Application: $APP_NAME
Path: $APP_PATH

Backup Contents:
EOF

    # List all backup files
    ls -la "$BACKUP_DIR"/*_$DATE.* >> "$BACKUP_DIR/backup_manifest_$DATE.txt" 2>/dev/null || true
    
    # Add system information
    cat >> "$BACKUP_DIR/backup_manifest_$DATE.txt" << EOF

System Information:
- OS: $(lsb_release -d | cut -f2)
- Kernel: $(uname -r)
- Disk Usage: $(df -h $APP_PATH | tail -1)
- Memory: $(free -h | grep Mem | awk '{print $2}')

Docker Containers:
EOF

    docker-compose ps >> "$BACKUP_DIR/backup_manifest_$DATE.txt" 2>/dev/null || true
    
    success "Backup manifest created: backup_manifest_$DATE.txt"
}

# Function to clean old backups
clean_old_backups() {
    log "🧹 Cleaning old backups (older than $RETENTION_DAYS days)..."
    
    # Find and remove old backup files
    find "$BACKUP_DIR" -name "*.sql.gz" -mtime +$RETENTION_DAYS -delete 2>/dev/null || true
    find "$BACKUP_DIR" -name "*.tar.gz" -mtime +$RETENTION_DAYS -delete 2>/dev/null || true
    find "$BACKUP_DIR" -name "backup_manifest_*.txt" -mtime +$RETENTION_DAYS -delete 2>/dev/null || true
    
    success "Old backups cleaned (retention: $RETENTION_DAYS days)"
}

# Function to show backup summary
show_backup_summary() {
    echo ""
    echo "========================================="
    echo "💾 Backup Summary"
    echo "========================================="
    echo ""
    success "Backup completed successfully!"
    echo ""
    info "📁 Backup Location: $BACKUP_DIR"
    echo ""
    info "📋 Backup Files:"
    ls -la "$BACKUP_DIR"/*_$DATE.* 2>/dev/null || echo "No backup files found"
    echo ""
    info "💾 Backup Size:"
    du -sh "$BACKUP_DIR"/*_$DATE.* 2>/dev/null || echo "No backup files found"
    echo ""
    info "🔄 Next Backup: Run this script again or setup automated backups"
    echo ""
}

# Function to setup automated backups
setup_automated_backups() {
    log "⏰ Setting up automated backups..."
    
    # Create cron job for daily backups
    cat > /etc/cron.d/$APP_NAME-backup << EOF
# Daily backup for $APP_NAME application
0 2 * * * $USER $APP_PATH/backup.sh >> $APP_PATH/backup.log 2>&1
EOF

    success "Automated backups configured (daily at 2:00 AM)"
    info "Backup logs: $APP_PATH/backup.log"
}

# Main function
main() {
    echo ""
    echo "========================================="
    echo "💾 $APP_NAME Backup Script"
    echo "========================================="
    echo ""
    
    # Change to application directory
    cd "$APP_PATH"
    
    # Create backup directory
    create_backup_dir
    
    # Create backups
    backup_database
    backup_uploads
    backup_minio
    backup_config
    backup_ssl
    
    # Create manifest
    create_manifest
    
    # Clean old backups
    clean_old_backups
    
    # Show summary
    show_backup_summary
    
    # Ask about automated backups
    if [ "$1" != "--no-prompt" ]; then
        read -p "Do you want to setup automated daily backups? (y/N): " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            setup_automated_backups
        fi
    fi
}

# Show help if requested
if [ "$1" = "--help" ] || [ "$1" = "-h" ]; then
    echo "Usage: $0 [--no-prompt]"
    echo ""
    echo "This script will:"
    echo "  - Backup database"
    echo "  - Backup uploads"
    echo "  - Backup MinIO data"
    echo "  - Backup configuration files"
    echo "  - Backup SSL certificates"
    echo "  - Create backup manifest"
    echo "  - Clean old backups"
    echo ""
    echo "Options:"
    echo "  --no-prompt    Skip interactive prompts"
    echo "  --help, -h     Show this help message"
    echo ""
    exit 0
fi

# Run main function
main "$@"
