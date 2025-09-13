# CEMSE - Plataforma Educativa y de Empleo

Una plataforma completa de educación, empleo y emprendimiento para jóvenes en Bolivia, construida con Next.js 15, TypeScript, Prisma y PostgreSQL.

## 🚀 Características Principales

### Para Jóvenes
- **Educación**: Cursos especializados con certificación automática
- **Empleo**: Búsqueda de trabajo y postulaciones abiertas
- **Emprendimiento**: Red de emprendedores y recursos especializados
- **CV Builder**: Constructor de CV con múltiples plantillas
- **Perfil Personalizado**: Seguimiento de progreso y logros

### Para Empresas
- **Gestión de Ofertas**: Publicar y administrar ofertas de trabajo
- **Reclutamiento**: Gestionar aplicaciones y candidatos
- **Chat Integrado**: Comunicación directa con candidatos
- **Reportes**: Estadísticas de contratación y rendimiento

### Para Instituciones
- **Gestión de Usuarios**: Administrar jóvenes, empresas e instituciones
- **Creación de Contenido**: Cursos, recursos y noticias
- **Reportes**: Estadísticas y análisis del sistema
- **Administración Completa**: Control total de la plataforma

## 🛠️ Tecnologías Utilizadas

### Frontend
- **Next.js 15.1.7** con App Router
- **React 19.0.0** con TypeScript
- **TailwindCSS 3.4.17** para estilos
- **shadcn/ui** para componentes
- **Framer Motion** para animaciones
- **React Query** para gestión de estado
- **React Hook Form + Zod** para formularios

### Backend
- **Next.js API Routes** (RESTful)
- **Prisma 6.4.0** como ORM
- **PostgreSQL** como base de datos
- **NextAuth.js 4.24.11** para autenticación
- **bcryptjs** para hash de contraseñas
- **crypto-js** para encriptación

### Infraestructura
- **Docker** para contenedores
- **MinIO** para almacenamiento de archivos
- **Redis** para caché
- **Prisma Studio** para administración de BD

## 📋 Requisitos Previos

- Node.js 18+ 
- pnpm (recomendado) o npm
- Docker y Docker Compose
- Git

## 🚀 Instalación y Configuración

### 1. Clonar el Repositorio

```bash
git clone <repository-url>
cd cemse
```

### 2. Instalar Dependencias

```bash
pnpm install
```

### 3. Configurar Variables de Entorno

Copia el archivo de ejemplo y configura las variables:

```bash
cp env.example .env.local
```

Edita `.env.local` con tus configuraciones:

```env
# Database
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/cemse_dev"
DIRECT_URL="postgresql://postgres:postgres@localhost:5432/cemse_dev"

# Authentication
NEXTAUTH_SECRET="your-secret-key-here"
NEXTAUTH_URL="http://localhost:3000"
JWT_SECRET="your-jwt-secret-here"

# MinIO Configuration
MINIO_ENDPOINT="localhost"
MINIO_PORT=9000
MINIO_ACCESS_KEY="minioadmin"
MINIO_SECRET_KEY="minioadmin"
MINIO_USE_SSL=false
MINIO_BASE_URL="http://localhost:9000"

# Redis
REDIS_URL="redis://localhost:6379"

# Application
NODE_ENV="development"
PORT=3000
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

### 4. Iniciar Servicios con Docker

```bash
# Iniciar PostgreSQL, Redis y MinIO
pnpm run docker:up

# Verificar que los servicios estén funcionando
pnpm run docker:logs
```

### 5. Configurar la Base de Datos

```bash
# Generar el cliente de Prisma
pnpm run db:generate

# Ejecutar migraciones
pnpm run db:push

# Poblar la base de datos con datos de ejemplo
pnpm run db:seed
```

### 6. Iniciar la Aplicación

```bash
# Modo desarrollo
pnpm run dev

# O modo desarrollo con limpieza de caché
pnpm run dev:clean
```

La aplicación estará disponible en `http://localhost:3000`

## 🗄️ Estructura del Proyecto

```
src/
├── app/                          # Next.js App Router
│   ├── (auth)/                   # Rutas de autenticación
│   │   ├── sign-in/             # Página de inicio de sesión
│   │   ├── sign-up/             # Página de registro
│   │   ├── forgot-password/     # Recuperación de contraseña
│   │   └── reset-password/      # Restablecer contraseña
│   ├── (dashboard)/             # Rutas del dashboard
│   │   ├── admin/               # Panel de administración
│   │   ├── company/             # Panel de empresa
│   │   ├── courses/             # Gestión de cursos
│   │   ├── jobs/                # Gestión de empleos
│   │   ├── entrepreneurship/    # Emprendimiento
│   │   └── profile/             # Perfil de usuario
│   ├── api/                     # API Routes
│   │   ├── auth/                # Endpoints de autenticación
│   │   ├── courses/             # Endpoints de cursos
│   │   ├── jobs/                # Endpoints de empleos
│   │   └── files/               # Endpoints de archivos
│   └── layout.tsx               # Layout principal
├── components/                   # Componentes reutilizables
│   ├── ui/                      # Componentes de shadcn/ui
│   └── [domain]/                # Componentes específicos por dominio
├── hooks/                       # Custom React hooks
├── lib/                         # Utilidades y configuración
│   ├── providers/               # Context providers
│   ├── auth.ts                  # Configuración de autenticación
│   └── prisma.ts                # Cliente de Prisma
├── services/                    # Servicios de API
├── types/                       # Definiciones de TypeScript
└── context/                     # Context providers
```

## 👥 Usuarios de Prueba

Después de ejecutar el seed, tendrás estos usuarios disponibles:

### Administrador
- **Email**: admin@cemse.com
- **Contraseña**: admin123
- **Rol**: SUPERADMIN

### Institución
- **Email**: institution@cemse.com
- **Contraseña**: institution123
- **Rol**: INSTITUTION

### Empresa
- **Email**: company@cemse.com
- **Contraseña**: company123
- **Rol**: COMPANIES

### Joven
- **Email**: youth@cemse.com
- **Contraseña**: youth123
- **Rol**: YOUTH

## 🐳 Comandos Docker

```bash
# Iniciar todos los servicios
pnpm run docker:up

# Detener todos los servicios
pnpm run docker:down

# Ver logs de los servicios
pnpm run docker:logs

# Limpiar volúmenes y contenedores
pnpm run docker:clean

# Iniciar en modo producción
pnpm run docker:prod
```

## 🗄️ Comandos de Base de Datos

```bash
# Generar cliente de Prisma
pnpm run db:generate

# Aplicar cambios al esquema
pnpm run db:push

# Crear migración
pnpm run db:migrate

# Abrir Prisma Studio
pnpm run db:studio

# Poblar con datos de ejemplo
pnpm run db:seed

# Resetear base de datos
pnpm run db:reset
```

## 🎨 Personalización

### Colores y Tema
Los colores del sistema están definidos en `src/app/globals.css` usando variables CSS. Puedes personalizar:

- Colores primarios y secundarios
- Colores de estado (éxito, error, advertencia)
- Colores de fondo y texto
- Bordes y sombras

### Componentes UI
Los componentes están en `src/components/ui/` y siguen el sistema de diseño de shadcn/ui. Puedes:

- Modificar estilos existentes
- Crear nuevos componentes
- Personalizar variantes

## 📱 Responsive Design

La aplicación está optimizada para:
- **Mobile**: 320px - 768px
- **Tablet**: 768px - 1024px
- **Desktop**: 1024px+

## 🔒 Seguridad

- Autenticación con NextAuth.js
- Hash de contraseñas con bcryptjs
- Encriptación de datos sensibles
- Validación de entrada con Zod
- Headers de seguridad configurados
- Sanitización de datos

## 🚀 Despliegue

### Variables de Entorno de Producción

```env
NODE_ENV=production
DATABASE_URL="postgresql://user:password@host:port/database"
NEXTAUTH_SECRET="your-production-secret"
NEXTAUTH_URL="https://yourdomain.com"
MINIO_ENDPOINT="your-minio-endpoint"
MINIO_ACCESS_KEY="your-access-key"
MINIO_SECRET_KEY="your-secret-key"
REDIS_URL="redis://your-redis-url"
```

### Build y Deploy

```bash
# Build de producción
pnpm run build

# Iniciar en producción
pnpm run start
```

## 🤝 Contribución

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.

## 📞 Soporte

Para soporte técnico o preguntas:
- Email: soporte@cemse.com
- Documentación: [docs.cemse.com](https://docs.cemse.com)
- Issues: [GitHub Issues](https://github.com/cemse/issues)

## 🎯 Roadmap

### Próximas Características
- [ ] Sistema de notificaciones en tiempo real
- [ ] Integración con redes sociales
- [ ] App móvil nativa
- [ ] Sistema de pagos integrado
- [ ] Analytics avanzados
- [ ] API pública
- [ ] Integración con LinkedIn
- [ ] Sistema de recomendaciones

---

**CEMSE** - Construyendo el futuro de la educación y el empleo en Bolivia 🇧🇴