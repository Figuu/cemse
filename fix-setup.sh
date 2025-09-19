#!/bin/bash

# =============================================================================
# CEMSE Setup Fix Script
# =============================================================================
# This script fixes common setup issues and continues the installation
# =============================================================================

set -e  # Exit on any error

# Configuration
APP_NAME="cemse"
APP_PATH="/opt/$APP_NAME"
GIT_REPO="https://github.com/figuu/cemse.git"

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
    if [[ $EUID -eq 0 ]]; then
        error "This script should not be run as root. Please run as a regular user with sudo privileges."
        exit 1
    fi
}

# Function to fix repository issue
fix_repository() {
    log "🔧 Fixing repository issue..."
    
    # Check current state
    if [ -d "$APP_PATH" ]; then
        info "Directory $APP_PATH exists"
        
        if [ -d "$APP_PATH/.git" ]; then
            info "Git repository already exists, pulling latest changes..."
            cd $APP_PATH
            git pull
        else
            warn "Directory exists but is not a git repository"
            
            # Check what's in the directory
            info "Contents of $APP_PATH:"
            ls -la $APP_PATH
            
            read -p "Do you want to remove the existing directory and clone fresh? (y/N): " -n 1 -r
            echo
            if [[ $REPLY =~ ^[Yy]$ ]]; then
                warn "Removing existing directory..."
                sudo rm -rf $APP_PATH
                sudo mkdir -p $APP_PATH
                sudo chown $USER:$USER $APP_PATH
                cd $APP_PATH
                git clone $GIT_REPO .
            else
                error "Cannot proceed without a clean directory. Please remove $APP_PATH manually or choose 'y' to remove it automatically."
                exit 1
            fi
        fi
    else
        error "Directory $APP_PATH does not exist. Please run the setup script first."
        exit 1
    fi
    
    # Set proper ownership
    sudo chown -R $USER:$USER $APP_PATH
    success "Repository fixed"
}

# Function to continue setup
continue_setup() {
    log "🚀 Continuing setup process..."
    
    cd $APP_PATH
    
    # Install dependencies
    log "📦 Installing dependencies..."
    pnpm install
    
    # Generate Prisma client
    log "🔧 Generating Prisma client..."
    pnpm prisma generate
    
    success "Setup continuation completed"
}

# Function to show next steps
show_next_steps() {
    echo ""
    echo "========================================="
    echo "🎉 Setup Fix Complete!"
    echo "========================================="
    echo ""
    success "Repository issue has been resolved!"
    echo ""
    info "📋 Next Steps:"
    echo ""
    echo "1. Configure your environment:"
    echo "   nano $APP_PATH/.env"
    echo ""
    echo "2. Deploy the application:"
    echo "   cd $APP_PATH"
    echo "   ./deploy.sh"
    echo ""
    echo "3. Configure domain (optional):"
    echo "   ./configure-domain.sh your-domain.com"
    echo ""
    echo "4. Setup SSL certificate (after domain setup):"
    echo "   sudo ./setup-ssl.sh"
    echo ""
    echo "5. Enable auto-start:"
    echo "   sudo systemctl enable $APP_NAME"
    echo ""
    info "🔧 Management Commands:"
    echo "   - Deploy: $APP_NAME-manage deploy"
    echo "   - Status: $APP_NAME-manage status"
    echo "   - Logs: $APP_NAME-manage logs"
    echo "   - Restart: $APP_NAME-manage restart"
    echo ""
}

# Main function
main() {
    echo ""
    echo "========================================="
    echo "🔧 $APP_NAME Setup Fix"
    echo "========================================="
    echo ""
    
    # Check if running as root
    check_root
    
    # Fix repository issue
    fix_repository
    
    # Continue setup
    continue_setup
    
    # Show next steps
    show_next_steps
}

# Run main function
main "$@"
