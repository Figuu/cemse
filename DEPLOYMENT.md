# 🚀 CEMSE Deployment Guide

This guide shows how to deploy CEMSE using the same Docker Compose file for both development and production environments.

## 📋 Prerequisites

- Docker and Docker Compose installed
- Domain name (for production)
- SSL certificate (for production)

## 🏗️ Architecture

The deployment includes these services:
- **Next.js Application** - Main web application
- **PostgreSQL** - Database
- **Redis** - Caching
- **MinIO** - Object storage for files
- **Prisma Studio** - Database management (development only)

## 🔧 Environment Configuration

### Development Environment
```bash
# Copy environment template
cp env.template .env

# Start development
pnpm run docker:up
```

### Production Environment
```bash
# Copy environment template
cp env.template .env

# Edit .env with production values
# Set NODE_ENV=production
# Update passwords and URLs

# Start production
pnpm run docker:prod
```

## 📁 Environment Configuration

### Single `.env` File
- **Development**: Uses default values from `env.template`
- **Production**: Edit `.env` to set `NODE_ENV=production` and secure passwords
- **MinIO**: `minioadmin`/`minioadmin` (change in production)
- **Database**: `cemse_dev` (change to `cemse_prod` in production)

## 🚀 Quick Start

### Development
```bash
# Start everything for development
pnpm run docker:up

# Or with Prisma Studio
pnpm run docker:dev
```

### Production
```bash
# Start everything for production
pnpm run docker:prod
```

## 🔧 Available Commands

| Command | Description |
|---------|-------------|
| `pnpm run docker:up` | Start development environment |
| `pnpm run docker:prod` | Start production environment |
| `pnpm run docker:dev` | Start development with Prisma Studio |
| `pnpm run docker:down` | Stop all services |
| `pnpm run docker:logs` | View logs |
| `pnpm run docker:status` | Check service status |
| `pnpm run docker:clean` | Clean everything (removes volumes) |
| `pnpm run docker:verify` | Verify setup |

## 🌐 Access Points

### Development
- **Application**: http://localhost:3000
- **MinIO Console**: http://localhost:9001
- **Prisma Studio**: http://localhost:5555

### Production
- **Application**: https://your-domain.com
- **MinIO Console**: https://your-domain.com:9001

## 🔐 Production Security

### 1. Update Environment Variables
Edit `env.production` with secure values:

```env
# Database
POSTGRES_PASSWORD=your-secure-database-password

# MinIO
MINIO_ROOT_PASSWORD=your-secure-minio-password

# Authentication
NEXTAUTH_SECRET=your-secure-nextauth-secret
JWT_SECRET=your-secure-jwt-secret

# URLs
NEXTAUTH_URL=https://your-domain.com
MINIO_PUBLIC_URL=https://your-domain.com:9000
```

### 2. SSL Certificate
Place your SSL certificates in the project root:
- `ssl/cert.pem` - SSL certificate
- `ssl/key.pem` - SSL private key

### 3. Reverse Proxy (Optional)
For production, consider using a reverse proxy like Nginx:

```nginx
server {
    listen 80;
    server_name your-domain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl;
    server_name your-domain.com;
    
    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

## 📦 MinIO Buckets

The following buckets are automatically created:
- `uploads` - General file uploads
- `videos` - Course videos
- `images` - Thumbnails, profile pictures
- `documents` - PDFs, documents
- `audio` - Audio files
- `temp` - Temporary files

## 🔍 Monitoring

### Check Service Status
```bash
pnpm run docker:status
```

### View Logs
```bash
# All services
pnpm run docker:logs

# Specific service
docker-compose logs nextjs
docker-compose logs minio
```

### Verify Setup
```bash
pnpm run docker:verify
```

## 🐛 Troubleshooting

### Services Not Starting
```bash
# Check logs
pnpm run docker:logs

# Restart everything
pnpm run docker:down
pnpm run docker:up
```

### Database Issues
```bash
# Reset database
pnpm run docker:clean
pnpm run docker:up
```

### MinIO Issues
```bash
# Check MinIO logs
docker-compose logs minio
docker-compose logs mc
docker-compose logs minio-init
```

## 🔄 Updates

### Update Application
```bash
# Pull latest changes
git pull

# Rebuild and restart
pnpm run docker:down
pnpm run docker:up
```

### Database Migrations
Migrations run automatically on startup, but you can run them manually:

```bash
# Access the application container
docker-compose exec nextjs sh

# Run migrations
npx prisma migrate deploy
```

## 📊 Performance

### Resource Requirements
- **Minimum**: 2GB RAM, 1 CPU
- **Recommended**: 4GB RAM, 2 CPU
- **Production**: 8GB RAM, 4 CPU

### Scaling
For high-traffic production:
1. Use external PostgreSQL (AWS RDS, etc.)
2. Use external Redis (AWS ElastiCache, etc.)
3. Use external MinIO (AWS S3, etc.)
4. Use load balancer for multiple app instances

## 🎯 Production Checklist

- [ ] Update all passwords in `env.production`
- [ ] Set up SSL certificates
- [ ] Configure domain name
- [ ] Set up monitoring
- [ ] Configure backups
- [ ] Test all functionality
- [ ] Set up log rotation
- [ ] Configure firewall rules

## 🚀 AWS Deployment

### Using AWS ECS
1. Create ECS cluster
2. Create task definition from docker-compose.yml
3. Create service with load balancer
4. Configure RDS for database
5. Configure ElastiCache for Redis
6. Use S3 instead of MinIO

### Using AWS EC2
1. Launch EC2 instance
2. Install Docker and Docker Compose
3. Clone repository
4. Copy `env.production` and update values
5. Run `pnpm run docker:prod`

## 📝 Notes

- All data is persisted in Docker volumes
- MinIO buckets are created automatically
- Database migrations run automatically
- The setup is idempotent (safe to run multiple times)
- Prisma Studio is only available in development

## 🎉 Success!

After running `pnpm run docker:prod`, your CEMSE application will be running with:
- ✅ Automatic MinIO bucket creation
- ✅ Database migrations
- ✅ File uploads to MinIO
- ✅ All services properly configured
- ✅ Production-ready setup

Visit your domain to start using the application! 🚀
