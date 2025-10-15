# 🎓 Emplea y Emprende - Educational Platform

A comprehensive educational platform for courses, institutions, and students built with Next.js, PostgreSQL, Redis, and MinIO.

## 🚀 Quick Start

### Development
```bash
# Install dependencies
pnpm install

# Copy environment template
cp env.template .env

# Start infrastructure services (database, redis, minio)
pnpm run docker:up

# Start Next.js application (in another terminal)
pnpm run dev:app

# Or start everything at once
pnpm run dev
```

### Production
```bash
# Copy environment template
cp env.template .env

# Edit .env with your production values
# Change NODE_ENV=production
# Update passwords and URLs

# Start infrastructure services
pnpm run docker:prod

# Start Next.js application
pnpm run dev:app
```

## 📋 Available Commands

| Command | Description |
|---------|-------------|
| `pnpm run dev` | Start infrastructure + Next.js app |
| `pnpm run docker:up` | Start infrastructure services only |
| `pnpm run dev:app` | Start Next.js application only |
| `pnpm run docker:down` | Stop infrastructure services |
| `pnpm run docker:logs` | View infrastructure logs |
| `pnpm run docker:status` | Check service status |
| `pnpm run docker:clean` | Clean everything (removes volumes) |

## 🏗️ Architecture

- **Next.js 15** - React framework with App Router
- **PostgreSQL** - Database with Prisma ORM
- **Redis** - Caching and sessions
- **MinIO** - Object storage for files
- **Docker** - Containerized deployment

## 🌐 Access Points

### Development
- **Application**: http://localhost:3000
- **MinIO Console**: http://localhost:9001 (minioadmin/minioadmin)
- **Prisma Studio**: http://localhost:5555

### Production
- **Application**: https://your-domain.com
- **MinIO Console**: https://your-domain.com:9001

## 📁 Project Structure

```
src/
├── app/                 # Next.js App Router
│   ├── (auth)/         # Authentication pages
│   ├── (dashboard)/    # Dashboard pages
│   └── api/            # API routes
├── components/         # React components
├── hooks/              # Custom React hooks
├── lib/                # Utilities and services
└── types/              # TypeScript types
```

## 🔧 Environment Configuration

### Development (`env.development`)
- Database: `emplea_y_emprende_dev`
- MinIO: `minioadmin`/`minioadmin`
- Includes Prisma Studio

### Production (`env.production`)
- Database: `emplea_y_emprende_prod`
- MinIO: Custom secure credentials
- Excludes Prisma Studio

## 📦 Features

- **Course Management** - Create and manage courses
- **Institution Dashboard** - Institution-specific features
- **Student Portal** - Course enrollment and progress
- **File Uploads** - Videos, images, documents via MinIO
- **Authentication** - NextAuth.js with role-based access
- **Real-time Features** - Messaging and notifications

## 🚀 Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed deployment instructions.

## 📝 License

Private - All rights reserved