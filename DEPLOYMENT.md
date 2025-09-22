# CEMSE Deployment Guide

## Quick Start for AWS EC2

### ✅ Issues Fixed

- **Container shutdown**: Added proper app service to docker-compose.yml with health checks
- **Missing cemse service**: App now runs in Docker container with restart policies
- **Shell script chaos**: Consolidated 10+ scripts into one `manage.sh` script
- **Deployment complexity**: Simplified to 3 essential scripts

### 🛠️ Essential Scripts (Keep Only These)

1. **`setup-ubuntu.sh`** - Complete Ubuntu 24.04 LTS setup
2. **`setup.sh`** - Complete Amazon Linux 2023 setup
3. **`manage.sh`** - ⭐ **NEW** - Unified management script

### ❌ Deleted/Deprecated Scripts
- `backup.sh` → Use `./manage.sh backup`
- `configure-domain.sh` → Use `./manage.sh domain <name>`
- `deploy.sh` → Use `./manage.sh deploy`
- `fix-nginx.sh` → Issues fixed in setup scripts
- `fix-setup.sh` → Issues resolved
- `health-check.sh` → Use `./manage.sh health`
- `setup-ssl.sh` → Use `./manage.sh ssl`
- `setup-nginx-production.sh` → Integrated in setup

## 🚀 Quick Start

### 1. Initial Server Setup

```bash
# Copy the setup script to your server
scp setup-ubuntu.sh ubuntu@your-server-ip:/home/ubuntu/

# SSH into your server
ssh ubuntu@your-server-ip

# Make the script executable and run it
chmod +x setup-ubuntu.sh
./setup-ubuntu.sh
```

The setup script will:
- Install all required dependencies (Node.js, Docker, Nginx, etc.)
- Clone your repository to `/opt/cemse`
- Configure systemd services
- Set up Nginx reverse proxy
- Configure firewall
- Create management scripts

### 2. Configure Environment

```bash
# Edit the environment file
nano /opt/cemse/.env

# Update with your actual values:
# - Database credentials
# - MinIO credentials
# - JWT secrets
# - Supabase keys (if using)
```

### 3. Deploy Application

```bash
# Run the deployment script
cd /opt/cemse
./deploy.sh
```

### 4. Configure Domain (Optional)

```bash
# Configure your domain
./configure-domain.sh your-domain.com

# Follow the DNS instructions provided
```

### 5. Setup SSL Certificate

```bash
# After DNS propagation, setup SSL
sudo ./setup-ssl.sh
```

## 🔧 Management Commands

After setup, you can use these management commands:

```bash
# Application management
cemse-manage start      # Start all services
cemse-manage stop       # Stop all services
cemse-manage restart    # Restart all services
cemse-manage status     # Check service status
cemse-manage logs       # View application logs
cemse-manage deploy     # Run deployment
cemse-manage update     # Pull latest code and deploy
cemse-manage ssl        # Setup SSL certificate
cemse-manage backup     # Create backup
cemse-manage health     # Run health check

# Domain management
cemse-domain new-domain.com  # Change domain

# Manual scripts
./backup.sh            # Create backup
./health-check.sh      # Run health check
./configure-domain.sh  # Configure domain
sudo ./setup-ssl.sh    # Setup SSL
```

## 📁 File Structure

```
/opt/cemse/
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
cemse-manage status
docker-compose ps
systemctl status cemse
```

### Logs

```bash
# Application logs
cemse-manage logs

# Nginx logs
sudo tail -f /var/log/nginx/cemse_*.log

# System logs
sudo journalctl -u cemse -f
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
cemse-manage update

# Or manually
git pull
./deploy.sh
```

### System Updates

```bash
# Update system packages
sudo apt update && sudo apt upgrade -y

# Restart services if needed
cemse-manage restart
```

## 🚨 Troubleshooting

### Common Issues

1. **Application not starting**
   ```bash
   cemse-manage status
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

- Application: `journalctl -u cemse`
- Nginx: `/var/log/nginx/cemse_*.log`
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
systemctl status cemse nginx docker
docker-compose ps

# Network
ss -tulpn
ufw status
```

### Log Analysis

```bash
# Recent errors
journalctl -u cemse --since "1 hour ago" | grep -i error

# Nginx errors
sudo tail -100 /var/log/nginx/cemse_error.log

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
