# Emplea y Emprende Deployment Guide

## Quick Start for AWS EC2

### ✅ Issues Fixed

- **Container shutdown**: Docker now only runs backend services (DB, Redis, MinIO) with auto-restart
- **Missing emplea-y-emprende service**: Fixed systemd service to run `pnpm start` directly on host
- **Shell script chaos**: Consolidated 10+ scripts into simplified management scripts
- **Update complexity**: ONE command now handles: git pull + migrations + restart

### 🛠️ Essential Scripts (Keep Only These)

1. **`setup-ubuntu.sh`** or **`setup.sh`** - Initial server setup (run once)
2. **`update.sh`** - ⭐ **Your main update command**
3. **`manage.sh`** - Service management (start/stop/status)

### 🚀 **Architecture Overview**

- **Docker containers** = Backend only (PostgreSQL, Redis, MinIO)
- **pnpm start** = Next.js app runs directly on host
- **emplea-y-emprende.service** = systemd keeps `pnpm start` running automatically
- **emplea-y-emprende-backend.service** = systemd keeps Docker containers running

### ❌ Deleted/Deprecated Scripts
- `backup.sh` → Use `./manage.sh backup`
- `configure-domain.sh` → Use `./manage.sh domain <name>`
- `deploy.sh` → Use `./update.sh`
- `fix-nginx.sh`, `fix-setup.sh` → Issues resolved
- `health-check.sh` → Use `./manage.sh health`
- `setup-ssl.sh` → Use `./manage.sh ssl`

## 🚀 Quick Start

### 1. Initial Server Setup

```bash
# For Ubuntu 24.04 LTS (Recommended)
./setup-ubuntu.sh

# For Amazon Linux 2023
./setup.sh
```

### 2. **ONE Command for Updates** ⭐

```bash
# This replaces ALL your manual steps:
./update.sh
```

**What it does automatically:**
- `git pull`
- `pnpm install` (if package.json changed)
- `pnpm prisma generate`
- `pnpm prisma migrate deploy`
- Restart Docker backend services
- Restart emplea-y-emprende service (`pnpm start`)
- Verify everything is working

### 3. Service Management

```bash
# Check if everything is running
./manage.sh status

# Start services
./manage.sh start

# Restart if needed
./manage.sh restart

# View logs
./manage.sh logs
```

### 4. Domain & SSL (Optional)

```bash
# Configure your domain
./manage.sh domain your-domain.com

# Setup SSL certificate (after DNS propagation)
./manage.sh ssl
```

### 5. NPM Commands

Alternative commands using npm/pnpm:

```bash
# Main update command
pnpm run update           # Same as ./update.sh

# Docker operations (backend only)
pnpm run docker:up        # Start backend containers
pnpm run docker:down      # Stop backend containers
pnpm run docker:logs      # View backend logs
pnpm run docker:status    # Check backend status

# Management operations
pnpm run manage:status    # Check all service status
pnpm run manage:restart   # Restart all services
pnpm run manage:logs      # View application logs
pnpm run manage:backup    # Create backup
pnpm run manage:health    # Health check
```

## 🔧 Management Commands

After setup, you can use these management commands:

```bash
# Application management
emplea-y-emprende-manage start      # Start all services
emplea-y-emprende-manage stop       # Stop all services
emplea-y-emprende-manage restart    # Restart all services
emplea-y-emprende-manage status     # Check service status
emplea-y-emprende-manage logs       # View application logs
emplea-y-emprende-manage deploy     # Run deployment
emplea-y-emprende-manage update     # Pull latest code and deploy
emplea-y-emprende-manage ssl        # Setup SSL certificate
emplea-y-emprende-manage backup     # Create backup
emplea-y-emprende-manage health     # Run health check

# Domain management
emplea-y-emprende-domain new-domain.com  # Change domain

# Manual scripts
./backup.sh            # Create backup
./health-check.sh      # Run health check
./configure-domain.sh  # Configure domain
sudo ./setup-ssl.sh    # Setup SSL
```

## 📁 File Structure

```
/opt/emplea-y-emprende/
├── deploy.sh              # Deployment script
├── configure-domain.sh    # Domain configuration
├── setup-ssl.sh          # SSL setup
├── backup.sh             # Backup script
├── health-check.sh       # Health check
├── .env                  # Environment configuration
├── docker-compose.yml    # Docker services
├── backups/              # Backup storage
└── public/uploads/       # File uploads
```

## 🌐 Service Ports

- **Application**: 3000 (internal)
- **Nginx**: 80, 443 (external)
- **PostgreSQL**: 5432 (internal)
- **Redis**: 6379 (internal)
- **MinIO**: 9000, 9001 (internal)

## 🔒 Security Features

- UFW firewall configuration
- SSL/TLS encryption
- Security headers
- Docker container isolation
- Non-root user execution
- Automatic SSL renewal

## 📊 Monitoring

### Health Checks

```bash
# Run comprehensive health check
./health-check.sh

# Check specific services
emplea-y-emprende-manage status
docker-compose ps
systemctl status emplea-y-emprende
```

### Logs

```bash
# Application logs
emplea-y-emprende-manage logs

# Nginx logs
sudo tail -f /var/log/nginx/emplea_y_emprende_*.log

# System logs
sudo journalctl -u emplea-y-emprende -f
```

## 💾 Backup & Recovery

### Create Backup

```bash
./backup.sh
```

Backups include:
- Database dump
- File uploads
- MinIO data
- Configuration files
- SSL certificates

### Automated Backups

```bash
# Setup daily backups at 2 AM
./backup.sh --no-prompt
```

## 🔄 Updates

### Application Updates

```bash
# Pull latest code and deploy
emplea-y-emprende-manage update

# Or manually
git pull
./deploy.sh
```

### System Updates

```bash
# Update system packages
sudo apt update && sudo apt upgrade -y

# Restart services if needed
emplea-y-emprende-manage restart
```

## 🚨 Troubleshooting

### Common Issues

1. **Application not starting**
   ```bash
   emplea-y-emprende-manage status
   docker-compose logs
   ```

2. **Database connection issues**
   ```bash
   docker-compose ps db
   docker-compose logs db
   ```

3. **SSL certificate issues**
   ```bash
   sudo certbot certificates
   sudo certbot renew --dry-run
   ```

4. **High memory usage**
   ```bash
   ./health-check.sh
   # Check if swap is configured
   free -h
   ```

### Log Locations

- Application: `journalctl -u emplea-y-emprende`
- Nginx: `/var/log/nginx/emplea_y_emprende_*.log`
- Docker: `docker-compose logs`
- System: `/var/log/syslog`

## 📈 Performance Optimization

### System Tuning

The setup script automatically applies:
- File descriptor limits
- Kernel parameters
- Swap configuration
- Gzip compression

### Monitoring

```bash
# System resources
htop
df -h
free -h

# Application performance
./health-check.sh
docker stats
```

## 🔐 Security Best Practices

1. **Keep system updated**
   ```bash
   sudo apt update && sudo apt upgrade -y
   ```

2. **Regular backups**
   ```bash
   ./backup.sh
   ```

3. **Monitor logs**
   ```bash
   ./health-check.sh
   ```

4. **SSL certificate renewal**
   - Automatically configured
   - Manual check: `sudo certbot renew --dry-run`

## 📞 Support

### Useful Commands

```bash
# System information
lsb_release -a
uname -a
df -h
free -h

# Service status
systemctl status emplea-y-emprende nginx docker
docker-compose ps

# Network
ss -tulpn
ufw status
```

### Log Analysis

```bash
# Recent errors
journalctl -u emplea-y-emprende --since "1 hour ago" | grep -i error

# Nginx errors
sudo tail -100 /var/log/nginx/emplea_y_emprende_error.log

# Docker logs
docker-compose logs --tail=100
```

## 🎯 Production Checklist

- [ ] Server setup completed
- [ ] Environment variables configured
- [ ] Application deployed successfully
- [ ] Domain configured and DNS propagated
- [ ] SSL certificate installed
- [ ] Firewall configured
- [ ] Backups configured
- [ ] Health monitoring active
- [ ] Log rotation configured
- [ ] Auto-start services enabled

## 📚 Additional Resources

- [Ubuntu Server 24.04 LTS Documentation](https://ubuntu.com/server/docs)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [Nginx Documentation](https://nginx.org/en/docs/)
- [Let's Encrypt Documentation](https://letsencrypt.org/docs/)
- [Node.js Documentation](https://nodejs.org/docs/)

---

**Note**: This deployment setup is optimized for Ubuntu Server 24.04 LTS. For other distributions, some package names and commands may differ.
