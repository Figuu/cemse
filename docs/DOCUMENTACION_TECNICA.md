# Documentación Técnica - CEMSE (Emplea y Emprende)

## Tabla de Contenidos
1. [Resumen Ejecutivo](#resumen-ejecutivo)
2. [Alcance y Funcionalidades](#alcance-y-funcionalidades)
3. [Arquitectura General](#arquitectura-general)
4. [Tecnologías Utilizadas](#tecnologías-utilizadas)
5. [Descripción de Módulos](#descripción-de-módulos)
6. [Integraciones Realizadas](#integraciones-realizadas)
7. [Endpoints API Principales](#endpoints-api-principales)
8. [Modelo de Datos](#modelo-de-datos)
9. [Seguridad y Autenticación](#seguridad-y-autenticación)
10. [Despliegue y Configuración](#despliegue-y-configuración)
11. [Capturas y Demostraciones](#capturas-y-demostraciones)
12. [Repositorio y Enlaces](#repositorio-y-enlaces)

---

## Resumen Ejecutivo

### Objetivo del Sistema

**CEMSE (Centro de Empleo y Emprendimiento)** es una plataforma web integral diseñada para facilitar la inserción laboral y el emprendimiento juvenil en Bolivia. El sistema conecta a jóvenes en búsqueda de empleo, empresas que ofrecen oportunidades laborales, e instituciones educativas que brindan capacitación.

### Propósito

- **Facilitar la empleabilidad juvenil** mediante conexión directa entre empresas y candidatos
- **Ofrecer capacitación continua** a través de cursos estructurados con certificación
- **Fomentar el emprendimiento** con herramientas de planificación de negocios y networking
- **Centralizar oportunidades** de desarrollo profesional y empresarial en una sola plataforma
- **Generar métricas e informes** para instituciones públicas y privadas

### Principales Módulos

1. **Sistema de Bolsa de Trabajo** - Publicación y postulación a ofertas laborales
2. **Sistema de Gestión de Cursos** - Capacitación online con certificación
3. **Hub de Emprendimiento** - Creación de negocios, planes de negocio y networking
4. **Gestión de Instituciones** - Panel multi-tenant para entidades educativas
5. **Postulaciones Abiertas (Promoción Juvenil)** - Autopromoción de jóvenes a empresas
6. **Sistema de Mensajería Unificado** - Comunicación contextual entre usuarios
7. **Analíticas y Reportes** - Métricas de desempeño y estadísticas de la plataforma
8. **Gestión de Perfiles y CV Builder** - Construcción de perfiles profesionales
9. **Panel Administrativo** - Aprobaciones, gestión de usuarios y configuración

### Estadísticas del Sistema

| Métrica | Cantidad |
|---------|----------|
| Modelos de Base de Datos | 33+ |
| Endpoints API | 151 |
| Componentes React | 200+ |
| Hooks Personalizados | 48+ |
| Roles de Usuario | 4 |
| Rutas de Página | 77 |
| Líneas de Código (Componentes) | 59,014 |
| Líneas de Código (Servicios) | 7,545 |

---

## Alcance y Funcionalidades

### Funcionalidades Entregadas

#### 1. Para Jóvenes (YOUTH)
- ✅ Registro y creación de perfil profesional completo
- ✅ Constructor de CV con múltiples plantillas
- ✅ Búsqueda y postulación a ofertas laborales
- ✅ Inscripción a cursos de capacitación
- ✅ Seguimiento de progreso de aprendizaje
- ✅ Obtención de certificados digitales
- ✅ Creación de perfiles de emprendimiento
- ✅ Herramienta de planificación de negocios (Business Plan)
- ✅ Networking con otros emprendedores
- ✅ Publicación en red social de emprendedores
- ✅ Postulaciones abiertas para promoción a empresas
- ✅ Sistema de mensajería con empresas e instituciones

#### 2. Para Empresas (COMPANIES)
- ✅ Creación de perfil corporativo
- ✅ Publicación de ofertas laborales con requisitos detallados
- ✅ Preguntas de filtro personalizadas
- ✅ Gestión de postulaciones recibidas
- ✅ Revisión de perfiles de candidatos
- ✅ Actualización de estados de aplicación (pipeline de contratación)
- ✅ Métricas de reclutamiento y contratación
- ✅ Búsqueda de talento en postulaciones abiertas
- ✅ Sistema de mensajería con candidatos
- ✅ Gestión de empleados contratados

#### 3. Para Instituciones Educativas (INSTITUTION)
- ✅ Panel multi-tenant con datos aislados
- ✅ Creación y publicación de cursos
- ✅ Organización de cursos en módulos y lecciones
- ✅ Múltiples tipos de contenido (video, audio, texto, quiz, documentos)
- ✅ Sistema de evaluación con quizzes
- ✅ Generación automática de certificados
- ✅ Seguimiento de estudiantes inscritos
- ✅ Analíticas de desempeño de cursos
- ✅ Reportes de inscripciones y finalizaciones
- ✅ Gestión de programas educativos

#### 4. Para Administradores (SUPERADMIN)
- ✅ Aprobación de nuevas empresas e instituciones
- ✅ Gestión de usuarios del sistema
- ✅ Configuración de parámetros globales
- ✅ Visualización de estadísticas generales
- ✅ Monitoreo de actividad de la plataforma
- ✅ Gestión de contenido (noticias, recursos)

#### 5. Funcionalidades Transversales
- ✅ Autenticación segura con JWT
- ✅ Sistema de roles y permisos
- ✅ Búsqueda global unificada
- ✅ Almacenamiento de archivos (MinIO/S3)
- ✅ Subida de archivos grandes por chunks
- ✅ Generación de PDFs (certificados, planes de negocio)
- ✅ Notificaciones por email
- ✅ Rate limiting en login
- ✅ Logging de seguridad
- ✅ Responsive design (mobile-first)
- ✅ Soporte de múltiples idiomas (preparado)

### Alcance Técnico

**Frontend:**
- Aplicación Next.js 15 con React 19
- 200+ componentes reutilizables
- 77 páginas y rutas
- Diseño responsive con Tailwind CSS
- Validación en tiempo real de formularios

**Backend:**
- 151 endpoints REST API
- Autenticación y autorización completa
- 33+ modelos de datos relacionados
- Procesamiento de archivos multimedia
- Sistema de caché preparado (Redis)

**Base de Datos:**
- Esquema completo con 33 modelos Prisma
- Relaciones complejas entre entidades
- Índices optimizados
- Migraciones versionadas

**Infraestructura:**
- Configuración Docker Compose
- Servicios containerizados
- Scripts de despliegue automatizado
- Health checks configurados

---

## Arquitectura General

### Diagrama de Arquitectura

```
┌─────────────────────────────────────────────────────────────────┐
│                         CAPA DE PRESENTACIÓN                     │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │              Next.js 15 Frontend (React 19)              │   │
│  │  ┌────────────┐  ┌────────────┐  ┌────────────┐        │   │
│  │  │  Dashboard │  │   Pages    │  │ Components │        │   │
│  │  │   Routes   │  │  (77 págs) │  │  (200+)    │        │   │
│  │  └────────────┘  └────────────┘  └────────────┘        │   │
│  │                                                           │   │
│  │  ┌────────────┐  ┌────────────┐  ┌────────────┐        │   │
│  │  │   Hooks    │  │   State    │  │   Forms    │        │   │
│  │  │   (48+)    │  │  (React    │  │  (React    │        │   │
│  │  │            │  │   Query)   │  │  Hook Form)│        │   │
│  │  └────────────┘  └────────────┘  └────────────┘        │   │
│  └──────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
                              ↓ HTTP/HTTPS
┌─────────────────────────────────────────────────────────────────┐
│                    CAPA DE MIDDLEWARE                            │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  ┌────────────┐  ┌────────────┐  ┌────────────┐        │   │
│  │  │   Auth     │  │    RBAC    │  │   CORS     │        │   │
│  │  │   (JWT)    │  │ Protection │  │  Headers   │        │   │
│  │  └────────────┘  └────────────┘  └────────────┘        │   │
│  └──────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                      CAPA DE APLICACIÓN                          │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │              API Routes (151 endpoints)                  │   │
│  │  ┌────────────┐  ┌────────────┐  ┌────────────┐        │   │
│  │  │   Jobs     │  │  Courses   │  │ Business   │        │   │
│  │  │   API      │  │    API     │  │   API      │        │   │
│  │  └────────────┘  └────────────┘  └────────────┘        │   │
│  │  ┌────────────┐  ┌────────────┐  ┌────────────┐        │   │
│  │  │ Institutions│ │ Companies  │  │   Admin    │        │   │
│  │  │    API     │  │    API     │  │    API     │        │   │
│  │  └────────────┘  └────────────┘  └────────────┘        │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │                 Servicios de Negocio                     │   │
│  │  ┌────────────┐  ┌────────────┐  ┌────────────┐        │   │
│  │  │ Analytics  │  │   MinIO    │  │Certificate │        │   │
│  │  │  Service   │  │  Service   │  │  Service   │        │   │
│  │  └────────────┘  └────────────┘  └────────────┘        │   │
│  │  ┌────────────┐  ┌────────────┐  ┌────────────┐        │   │
│  │  │  Business  │  │   Search   │  │   Email    │        │   │
│  │  │Plan Service│  │  Service   │  │  Service   │        │   │
│  │  └────────────┘  └────────────┘  └────────────┘        │   │
│  └──────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                      CAPA DE DATOS                               │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │                    Prisma ORM                            │   │
│  │              (Type-safe Database Client)                 │   │
│  └──────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                   CAPA DE INFRAESTRUCTURA                        │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐         │
│  │  PostgreSQL  │  │    MinIO     │  │    Redis     │         │
│  │  (Database)  │  │ (S3 Storage) │  │   (Cache)    │         │
│  │   Port 5432  │  │  Port 9000   │  │  Port 6379   │         │
│  └──────────────┘  └──────────────┘  └──────────────┘         │
│                                                                  │
│  ┌──────────────┐  ┌──────────────┐                            │
│  │    Resend    │  │   Leaflet    │                            │
│  │   (Email)    │  │    (Maps)    │                            │
│  └──────────────┘  └──────────────┘                            │
└─────────────────────────────────────────────────────────────────┘
```

### Arquitectura de Componentes Frontend

```
src/app/
├── (auth)/                    # Páginas públicas de autenticación
│   ├── sign-in/
│   ├── sign-up/
│   ├── forgot-password/
│   └── reset-password/
│
├── (dashboard)/               # Páginas protegidas (requieren login)
│   ├── admin/                 # Panel de administración
│   ├── companies/             # Panel de empresas
│   ├── institutions/          # Panel de instituciones
│   ├── courses/               # Sistema de cursos
│   ├── jobs/                  # Bolsa de trabajo
│   ├── profiles/              # Perfiles de usuario
│   ├── entrepreneurship/      # Hub de emprendimiento
│   ├── youth-applications/    # Postulaciones abiertas
│   ├── analytics/             # Analíticas
│   ├── messages/              # Mensajería
│   └── certificates/          # Certificados
│
└── api/                       # Backend API (151 endpoints)
    ├── auth/
    ├── jobs/
    ├── courses/
    ├── institutions/
    ├── companies/
    ├── entrepreneurship/
    ├── youth-applications/
    ├── admin/
    ├── files/
    ├── messages/
    └── analytics/
```

### Patrón de Arquitectura

**Arquitectura en Capas (Layered Architecture)**

1. **Capa de Presentación** - Next.js Pages y Components
2. **Capa de Middleware** - Autenticación, autorización, validación
3. **Capa de Aplicación** - API Routes y lógica de negocio
4. **Capa de Datos** - Prisma ORM
5. **Capa de Infraestructura** - PostgreSQL, MinIO, Redis

**Patrones Implementados:**
- **Repository Pattern** (Prisma abstraction)
- **Service Layer Pattern** (Business logic services)
- **Middleware Pattern** (Auth, logging, validation)
- **Factory Pattern** (Certificate generation, PDF exports)
- **Observer Pattern** (React Query, state management)
- **Multi-tenancy Pattern** (Institution data isolation)

---

## Tecnologías Utilizadas

### Frontend Stack

| Tecnología | Versión | Propósito |
|------------|---------|-----------|
| **Next.js** | 15.1.7 | Framework React con SSR/SSG |
| **React** | 19.0.0 | Biblioteca de UI |
| **TypeScript** | 5.x | Lenguaje tipado |
| **Tailwind CSS** | 3.4.1 | Framework CSS utility-first |
| **Radix UI** | Latest | Componentes accesibles sin estilos |
| **React Hook Form** | 7.62.0 | Gestión de formularios |
| **Zod** | 4.1.8 | Validación de esquemas |
| **React Query** | 5.87.4 | Gestión de estado del servidor |
| **Framer Motion** | 12.23.12 | Animaciones |
| **Lucide React** | 0.544.0 | Biblioteca de iconos |
| **Leaflet** | 1.9.4 | Mapas interactivos |
| **React Leaflet** | 5.0.0 | Integración Leaflet + React |
| **@react-pdf/renderer** | 4.3.0 | Generación de PDFs |
| **Sonner** | 2.0.7 | Sistema de notificaciones toast |

### Backend Stack

| Tecnología | Versión | Propósito |
|------------|---------|-----------|
| **Node.js** | 20.x | Runtime de JavaScript |
| **Next.js API Routes** | 15.1.7 | Backend serverless |
| **Prisma** | 6.16.1 | ORM para PostgreSQL |
| **NextAuth.js** | 4.24.11 | Autenticación y sesiones |
| **bcryptjs** | 3.0.2 | Hash de contraseñas |
| **MinIO** | 8.0.6 | Almacenamiento S3-compatible |
| **Resend** | 6.0.3 | Servicio de email |
| **Zod** | 4.1.8 | Validación backend |
| **isomorphic-dompurify** | 2.28.0 | Sanitización de inputs |
| **crypto-js** | 4.2.0 | Encriptación |
| **date-fns** | 4.1.0 | Manipulación de fechas |

### Base de Datos

| Tecnología | Versión | Propósito |
|------------|---------|-----------|
| **PostgreSQL** | 15.x | Base de datos relacional |
| **Prisma Migrate** | 6.16.1 | Migraciones de esquema |
| **Prisma Studio** | 6.16.1 | GUI de administración |

### Almacenamiento y Caché

| Tecnología | Versión | Propósito |
|------------|---------|-----------|
| **MinIO** | Latest | Object storage S3-compatible |
| **Redis** | 7.x | Caché y rate limiting |

### DevOps y Tooling

| Tecnología | Versión | Propósito |
|------------|---------|-----------|
| **Docker** | Latest | Containerización |
| **Docker Compose** | Latest | Orquestación local |
| **pnpm** | Latest | Gestor de paquetes |
| **ESLint** | 9.x | Linting de código |
| **Prettier** | 3.6.2 | Formateo de código |
| **Jest** | 30.1.3 | Framework de testing |
| **React Testing Library** | 16.3.0 | Testing de componentes |
| **tsx** | 4.20.5 | Ejecución de TypeScript |

### Infraestructura de Desarrollo

```yaml
Docker Services:
  - PostgreSQL: Base de datos principal
  - Redis: Caché y rate limiting
  - MinIO: Almacenamiento de archivos
  - MinIO Console: Interfaz administrativa
  - Prisma Studio: Explorador de base de datos
```

---

## Descripción de Módulos

### 1. Sistema de Bolsa de Trabajo

**Objetivo:** Conectar empresas con jóvenes candidatos para oportunidades laborales.

**Características Principales:**

- **Publicación de Ofertas (Empresas):**
  - Título, descripción y requisitos del puesto
  - Rango salarial con múltiples monedas (BOB por defecto)
  - Tipo de empleo: Tiempo completo, Medio tiempo, Pasantía, Voluntariado, Freelance
  - Modalidad: Presencial, Remoto, Híbrido
  - Ubicación con municipios de Bolivia
  - Nivel de experiencia requerido
  - Habilidades necesarias (tags)
  - Preguntas de filtro personalizadas
  - Fecha límite de postulación

- **Búsqueda y Postulación (Jóvenes):**
  - Filtros avanzados: salario, experiencia, modalidad, ubicación
  - Búsqueda por palabras clave
  - Visualización en mapa (Leaflet)
  - Guardado de ofertas favoritas
  - Postulación con CV y carta de presentación
  - Respuestas a preguntas de filtro
  - Seguimiento de estado de postulación

- **Pipeline de Contratación:**
  ```
  SENT → UNDER_REVIEW → PRE_SELECTED → HIRED / REJECTED
  ```

- **Gestión de Candidatos (Empresas):**
  - Lista de postulaciones recibidas
  - Revisión de perfiles completos
  - Actualización de estados
  - Mensajería con candidatos
  - Métricas de reclutamiento

**Modelos de Datos:**
- `JobOffer` - Ofertas de trabajo
- `JobApplication` - Postulaciones
- `JobQuestion` - Preguntas de filtro
- `JobQuestionAnswer` - Respuestas de candidatos

**Endpoints Principales:**
```
GET    /api/jobs                    # Listar ofertas con filtros
POST   /api/jobs                    # Crear oferta (empresa)
GET    /api/jobs/[id]               # Detalle de oferta
POST   /api/applications            # Postular a oferta
GET    /api/applications/[id]       # Ver postulación
PUT    /api/applications/[id]       # Actualizar estado
GET    /api/candidates              # Lista de candidatos (empresa)
```

**Ubicación en el Código:**
- Páginas: [src/app/(dashboard)/jobs/](src/app/(dashboard)/jobs/)
- API: [src/app/api/jobs/](src/app/api/jobs/), [src/app/api/applications/](src/app/api/applications/)
- Componentes: [src/components/jobs/](src/components/jobs/)

---

### 2. Sistema de Gestión de Cursos

**Objetivo:** Proporcionar capacitación online estructurada con certificación.

**Arquitectura del Curso:**

```
Curso
├── Módulo 1
│   ├── Lección 1 (Video)
│   ├── Lección 2 (Texto)
│   ├── Lección 3 (Quiz)
│   └── Certificado de Módulo
├── Módulo 2
│   ├── Lección 1 (Audio)
│   ├── Lección 2 (Documento)
│   └── Lección 3 (Ejercicio)
└── Certificado de Curso
```

**Características Principales:**

- **Creación de Cursos (Instituciones):**
  - Información general: título, descripción, thumbnail
  - 8 categorías: Soft Skills, Técnico, Emprendimiento, Alfabetización Digital, etc.
  - 3 niveles de dificultad: Principiante, Intermedio, Avanzado
  - Duración estimada y requisitos previos
  - Estructura modular jerárquica
  - Múltiples tipos de contenido:
    - VIDEO: Contenido en video
    - AUDIO: Podcasts o audio-lecciones
    - TEXT: Contenido escrito
    - QUIZ: Evaluaciones
    - EXERCISE: Ejercicios prácticos
    - DOCUMENT: PDFs y documentos
    - INTERACTIVE: Contenido interactivo

- **Sistema de Evaluación:**
  - Quizzes con múltiples preguntas
  - Tipos de pregunta: opción múltiple, verdadero/falso, respuesta corta
  - Intentos configurables (múltiples intentos permitidos)
  - Porcentaje mínimo para aprobar (70% por defecto)
  - Límite de tiempo opcional
  - Retroalimentación inmediata
  - Almacenamiento de intentos y puntuaciones

- **Progreso y Certificación:**
  - Seguimiento de lecciones completadas
  - Porcentaje de avance por módulo y curso
  - Tiempo dedicado por lección
  - Certificados de módulo (al completar módulos individuales)
  - Certificado de curso (al completar todos los módulos)
  - Generación automática de PDF con diseño profesional
  - Numeración única de certificados

- **Inscripción y Seguimiento:**
  - Inscripción a cursos con tracking de fecha
  - Estado de inscripción: ACTIVE, COMPLETED, PAUSED, CANCELLED
  - Historial de progreso
  - Calificaciones y evaluaciones

**Modelos de Datos:**
- `Course` - Cursos
- `CourseModule` - Módulos
- `Lesson` - Lecciones
- `CourseEnrollment` - Inscripciones
- `Quiz` - Evaluaciones
- `QuizAttempt` - Intentos de quiz
- `Certificate` - Certificados de curso
- `ModuleCertificate` - Certificados de módulo
- `LessonProgress` - Progreso de lecciones

**Endpoints Principales:**
```
GET    /api/courses                        # Listar cursos
POST   /api/courses                        # Crear curso
GET    /api/courses/[id]                   # Detalle de curso
POST   /api/courses/[id]/enroll            # Inscribirse
GET    /api/courses/[id]/progress          # Ver progreso
GET    /api/courses/[id]/modules           # Listar módulos
POST   /api/courses/[id]/modules           # Crear módulo
GET    /api/courses/[id]/quizzes           # Ver quizzes
POST   /api/quizzes/[id]/attempts          # Enviar respuestas
POST   /api/courses/[id]/certificate       # Generar certificado
GET    /api/courses/analytics              # Analíticas de cursos
```

**Ubicación en el Código:**
- Páginas: [src/app/(dashboard)/courses/](src/app/(dashboard)/courses/)
- API: [src/app/api/courses/](src/app/api/courses/)
- Componentes: [src/components/courses/](src/components/courses/)
- Servicios: [src/lib/certificateService.ts](src/lib/certificateService.ts)

---

### 3. Hub de Emprendimiento

**Objetivo:** Fomentar el emprendimiento con herramientas de planificación, networking y difusión.

**Características Principales:**

#### 3.1 Perfil de Emprendimiento
- Información del negocio: nombre, logo, descripción
- Etapa del negocio: IDEA → STARTUP → GROWING → ESTABLISHED
- Clasificación por industria y subcategoría
- Contacto y redes sociales
- Galería de imágenes del negocio
- Métricas de impacto (empleos generados, ingresos, etc.)

#### 3.2 Herramienta de Plan de Negocio
**Estructura Completa:**
- **Business Model Canvas (9 bloques):**
  - Propuesta de valor
  - Segmentos de clientes
  - Canales de distribución
  - Relaciones con clientes
  - Fuentes de ingresos
  - Recursos clave
  - Actividades clave
  - Socios clave
  - Estructura de costos

- **Proyecciones Financieras (3 años):**
  - Ingresos proyectados mensuales
  - Gastos operativos
  - Punto de equilibrio
  - Flujo de caja
  - Ratios financieros
  - Gráficas automáticas

- **Evaluación de Triple Impacto:**
  - Impacto social (empleos, desarrollo comunitario)
  - Impacto ambiental (sostenibilidad, huella de carbono)
  - Impacto económico (crecimiento, innovación)

- **Funcionalidades:**
  - Guardado automático
  - Porcentaje de completitud
  - Exportación a PDF profesional
  - Plantillas predefinidas
  - Calculadora financiera integrada

#### 3.3 Sistema de Networking
- **Conexiones entre Emprendedores:**
  - Envío de solicitudes de conexión
  - Estados: PENDING → ACCEPTED / DECLINED / BLOCKED
  - Mensaje opcional al conectar
  - Red de contactos visualizable
  - Búsqueda de emprendedores por industria/ubicación

#### 3.4 Red Social de Emprendimiento
- **Tipos de Publicaciones:**
  - TEXT: Actualizaciones de texto
  - IMAGE: Fotos del negocio/productos
  - VIDEO: Videos promocionales
  - LINK: Enlaces externos
  - POLL: Encuestas
  - EVENT: Eventos y ferias
  - QUESTION: Preguntas a la comunidad
  - ACHIEVEMENT: Logros alcanzados

- **Engagement:**
  - Likes en publicaciones
  - Comentarios (con respuestas anidadas)
  - Compartir publicaciones
  - Publicaciones destacadas (pinned)
  - Feed personalizado

#### 3.5 Base de Conocimientos
- **Recursos para Emprendedores:**
  - Artículos educativos
  - Videos tutoriales
  - Podcasts
  - Documentos descargables
  - Herramientas útiles
  - Plantillas de documentos
  - Guías paso a paso
  - Checklists
  - Webinars grabados
  - Cursos especializados

- **Categorización:**
  - Por tipo de recurso
  - Por etapa del negocio
  - Por industria
  - Recursos destacados

**Modelos de Datos:**
- `Entrepreneurship` - Negocios
- `BusinessPlan` - Planes de negocio
- `EntrepreneurshipConnection` - Conexiones
- `EntrepreneurshipPost` - Publicaciones
- `PostLike` - Likes
- `PostComment` - Comentarios
- `EntrepreneurshipResource` - Base de conocimientos

**Endpoints Principales:**
```
GET    /api/entrepreneurship/entrepreneurships     # Listar negocios
POST   /api/entrepreneurship/entrepreneurships     # Crear negocio
GET    /api/entrepreneurship/posts                 # Feed social
POST   /api/entrepreneurship/posts                 # Crear publicación
POST   /api/entrepreneurship/posts/[id]/like       # Like
POST   /api/entrepreneurship/posts/[id]/comments   # Comentar
GET    /api/entrepreneurship/connections           # Red de contactos
POST   /api/entrepreneurship/connections           # Conectar
GET    /api/entrepreneurship/resources             # Base conocimientos
```

**Ubicación en el Código:**
- Páginas: [src/app/(dashboard)/entrepreneurship/](src/app/(dashboard)/entrepreneurship/)
- API: [src/app/api/entrepreneurship/](src/app/api/entrepreneurship/)
- Componentes: [src/components/entrepreneurship/](src/components/entrepreneurship/)
- Servicios:
  - [src/lib/businessPlanService.ts](src/lib/businessPlanService.ts)
  - [src/lib/businessPlanTemplates.ts](src/lib/businessPlanTemplates.ts)
  - [src/lib/businessPlanExportService.ts](src/lib/businessPlanExportService.ts)
  - [src/lib/financialCalculatorService.ts](src/lib/financialCalculatorService.ts)

---

### 4. Gestión de Instituciones

**Objetivo:** Panel multi-tenant para instituciones educativas y municipalidades.

**Características Principales:**

- **Perfil Institucional:**
  - Información general (nombre, logo, descripción)
  - Tipo de institución: MUNICIPALITY, NGO, TRAINING_CENTER, FOUNDATION, OTHER
  - Ubicación y contacto
  - Personalización de marca (colores primarios/secundarios)
  - Certificación institucional
  - Programas y carreras ofrecidas

- **Gestión de Cursos:**
  - Creación y publicación de cursos propios
  - Organización de catálogo de cursos
  - Asignación de instructores
  - Configuración de cupos y fechas
  - Aprobación de inscripciones

- **Gestión de Estudiantes:**
  - Lista de estudiantes inscritos
  - Seguimiento de progreso individual
  - Historial académico
  - Generación de reportes
  - Comunicación con estudiantes

- **Analíticas Institucionales:**
  - Métricas de inscripciones
  - Tasas de finalización de cursos
  - Desempeño de estudiantes
  - Popularidad de cursos
  - Certificados emitidos
  - Tendencias de inscripción

- **Aprobación y Registro:**
  - Solicitud de registro institucional
  - Proceso de aprobación por SUPERADMIN
  - Estados: PENDING → APPROVED / REJECTED
  - Verificación de documentos

**Modelos de Datos:**
- `Institution` - Instituciones
- `Profile` - Perfiles de estudiantes asociados
- `Course` - Cursos institucionales

**Endpoints Principales:**
```
GET    /api/institutions                   # Listar instituciones
POST   /api/institutions                   # Crear institución
GET    /api/institutions/[id]              # Detalle institución
PUT    /api/institutions/[id]              # Actualizar
GET    /api/institutions/[id]/courses      # Cursos de institución
POST   /api/institutions/[id]/courses      # Crear curso
GET    /api/institutions/[id]/students     # Lista estudiantes
GET    /api/institutions/[id]/analytics    # Analíticas
GET    /api/institutions/[id]/reports      # Reportes
```

**Ubicación en el Código:**
- Páginas: [src/app/(dashboard)/institutions/](src/app/(dashboard)/institutions/)
- API: [src/app/api/institutions/](src/app/api/institutions/)
- Componentes: [src/components/institutions/](src/components/institutions/)

---

### 5. Sistema de Postulaciones Abiertas (Promoción Juvenil)

**Objetivo:** Permitir a jóvenes crear perfiles públicos para que empresas los descubran.

**Características Principales:**

- **Creación de Postulación Abierta:**
  - Título y descripción de perfil profesional
  - Habilidades y competencias destacadas
  - Experiencia laboral resumida
  - Educación y formación
  - CV y carta de presentación adjuntos
  - Expectativas salariales
  - Disponibilidad y modalidad preferida
  - Ubicación

- **Gestión de Estado:**
  - Estados: ACTIVE, PAUSED, CLOSED, HIRED
  - Control de visibilidad (público/privado)
  - Pausar/reactivar postulación

- **Para Empresas:**
  - Búsqueda de perfiles de jóvenes
  - Filtros por habilidades, experiencia, ubicación
  - Visualización de perfiles completos
  - Marcar interés en candidatos
  - Iniciar conversación con jóvenes
  - Seguimiento de candidatos marcados

- **Seguimiento (Jóvenes):**
  - Contador de visualizaciones
  - Lista de empresas interesadas
  - Notificaciones de interés
  - Mensajería con empresas
  - Estado de conversaciones

**Modelos de Datos:**
- `YouthApplication` - Postulaciones abiertas
- `YouthApplicationCompanyInterest` - Intereses de empresas

**Endpoints Principales:**
```
GET    /api/youth-applications             # Listar postulaciones
POST   /api/youth-applications             # Crear postulación
GET    /api/youth-applications/[id]        # Ver postulación
PUT    /api/youth-applications/[id]        # Actualizar
POST   /api/youth-applications/[id]/interests  # Marcar interés (empresa)
GET    /api/youth-applications/[id]/interests  # Ver intereses
```

**Ubicación en el Código:**
- Páginas: [src/app/(dashboard)/youth-applications/](src/app/(dashboard)/youth-applications/)
- API: [src/app/api/youth-applications/](src/app/api/youth-applications/)
- Componentes: [src/components/youth-applications/](src/components/youth-applications/)

---

### 6. Sistema de Mensajería Unificado

**Objetivo:** Comunicación contextual entre usuarios de la plataforma.

**Características Principales:**

- **Mensajería Contextual:**
  - Mensajes vinculados a contextos específicos:
    - `job_application` - Conversación sobre postulación a empleo
    - `youth_application` - Conversación sobre postulación abierta
    - `entrepreneurship` - Conversación sobre negocios/networking
    - `general` - Mensajes generales entre usuarios

- **Funcionalidades:**
  - Envío de mensajes de texto
  - Adjuntar archivos (documentos, imágenes)
  - Marcar mensajes como leídos/no leídos
  - Historial completo de conversaciones
  - Búsqueda en mensajes
  - Notificaciones de nuevos mensajes

- **Organización:**
  - Vista de conversaciones agrupadas
  - Filtro por contexto
  - Ordenamiento por fecha
  - Indicadores de mensajes no leídos
  - Vista de conversación individual

**Modelos de Datos:**
- `Message` - Mensajes

**Endpoints Principales:**
```
GET    /api/messages                       # Obtener mensajes
POST   /api/messages                       # Enviar mensaje
GET    /api/messages/conversations         # Listar conversaciones
GET    /api/messages/[id]                  # Ver mensaje específico
```

**Ubicación en el Código:**
- Páginas: [src/app/(dashboard)/messages/](src/app/(dashboard)/messages/)
- API: [src/app/api/messages/](src/app/api/messages/)
- Componentes: [src/components/messaging/](src/components/messaging/)

---

### 7. Analíticas y Reportes

**Objetivo:** Proporcionar insights y métricas de desempeño de la plataforma.

**Características Principales:**

#### 7.1 Analíticas Generales (Plataforma)
- **Métricas de Usuarios:**
  - DAU (Daily Active Users)
  - WAU (Weekly Active Users)
  - MAU (Monthly Active Users)
  - Tasa de retención
  - Nuevos registros por período
  - Distribución por roles
  - Distribución geográfica

- **Métricas de Empleo:**
  - Ofertas activas
  - Postulaciones totales
  - Tasa de contratación
  - Tiempo promedio de contratación
  - Empresas activas
  - Distribución por industria

- **Métricas de Educación:**
  - Cursos activos
  - Inscripciones totales
  - Tasa de finalización
  - Certificados emitidos
  - Horas de capacitación
  - Instituciones activas

- **Métricas de Emprendimiento:**
  - Negocios registrados
  - Planes de negocio completados
  - Conexiones realizadas
  - Publicaciones en red social
  - Engagement (likes, comentarios)

#### 7.2 Analíticas de Instituciones
- Inscripciones por curso
- Desempeño de estudiantes
- Tasa de finalización por curso
- Certificados emitidos
- Cursos más populares
- Tendencias de inscripción
- Reportes exportables (PDF/Excel)

#### 7.3 Analíticas de Empresas
- Ofertas publicadas
- Postulaciones recibidas
- Pipeline de contratación (embudo)
- Tiempo promedio de contratación
- Tasa de aceptación de ofertas
- Calidad de candidatos
- Métricas de reclutamiento

#### 7.4 Analíticas de Instructores
- Cursos impartidos
- Estudiantes totales
- Calificaciones recibidas
- Tasa de finalización
- Engagement de estudiantes

**Servicios:**
- `AnalyticsService` - Servicio centralizado de analíticas

**Endpoints Principales:**
```
GET    /api/analytics                      # Analíticas generales
GET    /api/courses/analytics              # Analíticas de cursos
GET    /api/courses/analytics/reports      # Reportes de cursos
GET    /api/company/analytics              # Analíticas de empresas
GET    /api/profiles/analytics             # Analíticas de perfiles
GET    /api/instructor/analytics           # Analíticas de instructores
```

**Ubicación en el Código:**
- Páginas: [src/app/(dashboard)/analytics/](src/app/(dashboard)/analytics/)
- API: [src/app/api/analytics/](src/app/api/analytics/)
- Componentes: [src/components/analytics/](src/components/analytics/)
- Servicios: [src/lib/analyticsService.ts](src/lib/analyticsService.ts)

---

### 8. Gestión de Perfiles y CV Builder

**Objetivo:** Permitir a usuarios crear perfiles profesionales completos con CV.

**Características Principales:**

#### 8.1 Perfil de Usuario Extendido
- **Información Personal:**
  - Nombre completo
  - Foto de perfil / Avatar
  - Fecha de nacimiento
  - Género
  - Ubicación (municipio)
  - Información de contacto
  - Biografía profesional

- **Información Profesional:**
  - Título profesional
  - Industria
  - Años de experiencia
  - Habilidades (con nivel de dominio)
  - Idiomas (con nivel de competencia)
  - Enlaces a redes sociales (LinkedIn, GitHub, portfolio)

- **Historial Académico:**
  - Instituciones educativas
  - Títulos obtenidos
  - Fechas de inicio/fin
  - Área de estudio

- **Experiencia Laboral:**
  - Empresas anteriores
  - Cargos desempeñados
  - Fechas de inicio/fin
  - Descripción de responsabilidades
  - Logros destacados

- **Portafolio de Proyectos:**
  - Proyectos realizados
  - Descripción
  - Tecnologías utilizadas
  - Enlaces a demos/repositorios
  - Imágenes del proyecto

#### 8.2 Constructor de CV
- **Plantillas Profesionales:**
  - Múltiples diseños predefinidos
  - Personalización de colores
  - Ajuste de secciones

- **Generación Automática:**
  - Datos del perfil
  - Formato profesional
  - Exportación a PDF
  - Almacenamiento en MinIO

- **Secciones del CV:**
  - Encabezado con datos de contacto
  - Resumen profesional
  - Experiencia laboral
  - Educación
  - Habilidades técnicas
  - Idiomas
  - Certificaciones
  - Proyectos destacados
  - Referencias

#### 8.3 Constructor de Carta de Presentación
- **Plantillas Personalizables:**
  - Formato profesional
  - Personalización por empresa/puesto
  - Variables dinámicas (nombre empresa, puesto)

- **Elementos:**
  - Saludo personalizado
  - Presentación personal
  - Motivación para el puesto
  - Habilidades relevantes
  - Llamado a la acción
  - Despedida formal

#### 8.4 Gestión de Documentos
- Subida de CV personalizado (PDF, DOCX)
- Subida de carta de presentación
- Historial de versiones
- Almacenamiento seguro en MinIO

**Modelos de Datos:**
- `Profile` - Perfiles extendidos (con campos JSON)

**Endpoints Principales:**
```
GET    /api/profiles/[id]                  # Obtener perfil
PUT    /api/profiles/[id]                  # Actualizar perfil
POST   /api/cv/upload                      # Subir CV
POST   /api/cover-letter/upload            # Subir carta
GET    /api/profiles/analytics             # Analíticas de perfil
```

**Ubicación en el Código:**
- Páginas: [src/app/(dashboard)/profiles/](src/app/(dashboard)/profiles/)
- API: [src/app/api/profiles/](src/app/api/profiles/)
- Componentes:
  - [src/components/profile/](src/components/profile/)
  - [src/components/cv-builder/](src/components/cv-builder/)

---

### 9. Panel Administrativo

**Objetivo:** Gestión centralizada de la plataforma (solo SUPERADMIN).

**Características Principales:**

- **Aprobación de Entidades:**
  - Lista de empresas pendientes de aprobación
  - Lista de instituciones pendientes
  - Revisión de información proporcionada
  - Aprobación o rechazo con motivo
  - Notificaciones automáticas

- **Gestión de Usuarios:**
  - Lista completa de usuarios
  - Búsqueda y filtrado
  - Visualización de perfiles
  - Cambio de roles
  - Bloqueo/desbloqueo de cuentas
  - Historial de actividad

- **Gestión de Contenido:**
  - Publicación de noticias
  - Gestión de recursos educativos
  - Categorías y etiquetas
  - Contenido destacado

- **Estadísticas Generales:**
  - Dashboard con métricas clave
  - Gráficas de crecimiento
  - Reportes exportables
  - Alertas y notificaciones

- **Configuración del Sistema:**
  - Parámetros globales
  - Configuración de aprobaciones
  - Gestión de categorías
  - Textos personalizables

**Endpoints Principales:**
```
GET    /api/admin/companies                # Listar empresas
GET    /api/admin/pending-companies        # Empresas pendientes
POST   /api/admin/pending-companies/[id]/approve
POST   /api/admin/pending-companies/[id]/reject
GET    /api/admin/institutions             # Listar instituciones
GET    /api/admin/pending-institutions     # Instituciones pendientes
POST   /api/admin/pending-institutions/[id]/approve
POST   /api/admin/pending-institutions/[id]/reject
GET    /api/admin/users                    # Listar usuarios
GET    /api/admin/stats                    # Estadísticas
```

**Ubicación en el Código:**
- Páginas: [src/app/(dashboard)/admin/](src/app/(dashboard)/admin/)
- API: [src/app/api/admin/](src/app/api/admin/)
- Componentes: [src/components/admin/](src/components/admin/)

---

### 10. Gestión de Archivos

**Objetivo:** Almacenamiento seguro y eficiente de archivos multimedia.

**Características Principales:**

- **Almacenamiento MinIO (S3-compatible):**
  - Buckets organizados por tipo
  - Acceso público/privado configurable
  - URLs pre-firmadas para seguridad
  - Políticas de expiración

- **Estructura de Buckets:**
  ```
  - uploads/          # Archivos generales
  - documents/        # PDFs, Word, Excel
  - images/           # Imágenes
  - videos/           # Videos
  - audio/            # Archivos de audio
  - temp/             # Archivos temporales
  - certificates/     # Certificados generados
  ```

- **Tipos de Subida:**
  - Subida simple (archivos pequeños < 50MB)
  - Subida por chunks (archivos grandes)
  - Procesamiento en segundo plano
  - Validación de tipos de archivo
  - Detección automática de MIME type

- **Funcionalidades:**
  - Generación de thumbnails para imágenes
  - Compresión automática (opcional)
  - Escaneo de virus (preparado)
  - Límites de tamaño configurables
  - Limpieza automática de archivos temporales

**Servicios:**
- `MinIOService` - Gestión de almacenamiento

**Endpoints Principales:**
```
POST   /api/files/upload                   # Subida simple
POST   /api/files/chunked-upload           # Subida por chunks
POST   /api/files/finalize-upload          # Completar subida chunked
GET    /api/files/minio/presigned          # URL pre-firmada
POST   /api/files/minio/upload             # Subida directa
GET    /api/files/minio/status             # Estado de MinIO
```

**Ubicación en el Código:**
- API: [src/app/api/files/](src/app/api/files/)
- Servicios: [src/lib/minioService.ts](src/lib/minioService.ts)
- Hooks: [src/hooks/useChunkedUpload.ts](src/hooks/useChunkedUpload.ts)

---

## Integraciones Realizadas

### 1. Autenticación con NextAuth.js

**Descripción:** Sistema completo de autenticación y gestión de sesiones.

**Configuración:**
- **Provider:** Credentials (email/password)
- **Session Strategy:** JWT (JSON Web Tokens)
- **Token Expiry:** 30 días (configurable)

**Características Implementadas:**
- Login con email y contraseña
- Registro de nuevos usuarios
- Recuperación de contraseña
- Cambio de contraseña
- Refresh de tokens automático
- Logout seguro
- Protección de rutas con middleware
- Inyección de datos de sesión (role, institutionId)

**Flujo de Autenticación:**
```
1. Usuario envía credenciales
2. Validación con bcrypt
3. Generación de JWT
4. Almacenamiento en cookie segura
5. Middleware valida token en cada request
6. Redirección basada en rol
```

**Archivo de Configuración:** [src/lib/auth.ts](src/lib/auth.ts:162)

---

### 2. Prisma ORM

**Descripción:** ORM type-safe para acceso a PostgreSQL.

**Características:**
- Auto-generación de tipos TypeScript
- Migraciones versionadas
- Prisma Studio para administración
- Relaciones complejas
- Queries optimizadas
- Connection pooling

**Modelos Principales:** 33 modelos (ver sección Modelo de Datos)

**Comandos Disponibles:**
```bash
pnpm run db:generate    # Generar Prisma Client
pnpm run db:push        # Sincronizar schema sin migración
pnpm run db:migrate     # Crear y aplicar migración
pnpm run db:studio      # Abrir Prisma Studio
pnpm run db:seed        # Poblar base de datos
```

**Archivo de Schema:** [prisma/schema.prisma](prisma/schema.prisma:1144)

---

### 3. MinIO para Almacenamiento

**Descripción:** Almacenamiento de objetos S3-compatible para archivos.

**Configuración:**
- **Endpoint:** localhost:9000 (desarrollo)
- **Console:** localhost:9001
- **Access Key:** Configurado vía env
- **Secret Key:** Configurado vía env

**Buckets Configurados:**
- `uploads` - Archivos generales
- `documents` - Documentos (PDF, DOCX)
- `images` - Imágenes optimizadas
- `videos` - Videos de lecciones
- `certificates` - Certificados generados

**Características:**
- URLs pre-firmadas para acceso seguro
- Políticas de bucket (público/privado)
- Subida directa desde cliente
- Integración con Next.js Image

**Servicio:** [src/lib/minioService.ts](src/lib/minioService.ts)

---

### 4. Generación de PDFs (@react-pdf/renderer)

**Descripción:** Generación dinámica de documentos PDF.

**Uso en la Plataforma:**

- **Certificados de Curso:**
  - Diseño profesional con plantillas
  - Datos dinámicos (nombre, curso, fecha)
  - Numeración única
  - Logo institucional
  - Firma digital (opcional)

- **Certificados de Módulo:**
  - Similar a certificados de curso
  - Específicos por módulo

- **Planes de Negocio:**
  - Exportación completa del Business Plan
  - Business Model Canvas visual
  - Proyecciones financieras con tablas
  - Gráficas embebidas
  - Formato profesional multi-página

**Servicios:**
- [src/lib/certificateService.ts](src/lib/certificateService.ts)
- [src/lib/businessPlanExportService.ts](src/lib/businessPlanExportService.ts)

---

### 5. Email con Resend

**Descripción:** Servicio transaccional de email.

**Tipos de Emails Enviados:**
- Recuperación de contraseña
- Confirmación de registro
- Notificación de contratación
- Certificado obtenido
- Mensajes nuevos
- Aprobación de empresa/institución
- Alertas administrativas

**Configuración:** API Key configurada en variables de entorno

---

### 6. Mapas con Leaflet

**Descripción:** Visualización de ubicaciones con mapas interactivos.

**Uso:**
- Mapa de ofertas laborales por ubicación
- Visualización de sedes de instituciones
- Ubicación de empresas
- Filtrado geográfico de oportunidades

**Integración:** React Leaflet para componentes React

**Componentes:**
- Mapa interactivo con marcadores
- Popups con información
- Zoom y navegación
- Clustering de marcadores (múltiples ofertas en área)

---

### 7. Validación con Zod

**Descripción:** Validación de esquemas tanto en frontend como backend.

**Uso:**
- Validación de formularios (React Hook Form + Zod)
- Validación de requests en API routes
- Validación de variables de entorno
- Type inference automático

**Ejemplo de Schema:**
```typescript
const jobOfferSchema = z.object({
  title: z.string().min(3).max(100),
  salary: z.object({
    min: z.number().positive(),
    max: z.number().positive(),
    currency: z.enum(['BOB', 'USD']),
  }),
  workType: z.enum(['FULL_TIME', 'PART_TIME', 'INTERNSHIP']),
  // ... más campos
})
```

---

### 8. React Query (TanStack Query)

**Descripción:** Gestión de estado del servidor y caché.

**Características:**
- Caché automático de queries
- Revalidación en background
- Optimistic updates
- Infinite queries (scroll infinito)
- Prefetching
- DevTools para debugging

**Hooks Personalizados:**
- `useApplications` - Gestión de postulaciones
- `useCourseAnalytics` - Analíticas de cursos
- `useBusinessPlans` - Planes de negocio
- `useCertificates` - Certificados
- +40 hooks más

---

### 9. Rate Limiting y Seguridad

**Descripción:** Protección contra abuso y ataques.

**Características Implementadas:**

- **Rate Limiting en Login:**
  - Máximo de intentos por IP
  - Lockout temporal tras múltiples fallos
  - Almacenamiento en memoria (Redis preparado)

- **Security Logger:**
  - Registro de intentos de login
  - Intentos fallidos
  - Bloqueos de cuenta
  - Cambios de contraseña
  - Acceso a recursos protegidos

- **Headers de Seguridad:**
  - Content Security Policy (CSP)
  - X-Frame-Options: SAMEORIGIN
  - X-Content-Type-Options: nosniff
  - Strict-Transport-Security
  - Referrer-Policy

- **Validación de Input:**
  - Sanitización con DOMPurify
  - Validación con Zod
  - Escape de HTML
  - Prevención de SQL injection (Prisma)

**Servicios:**
- [src/lib/rate-limiter.ts](src/lib/rate-limiter.ts:146)
- [src/lib/security-logger.ts](src/lib/security-logger.ts)
- [src/lib/input-validator.ts](src/lib/input-validator.ts)
- [src/lib/password-validator.ts](src/lib/password-validator.ts)

---

## Endpoints API Principales

### Resumen de Endpoints por Categoría

| Categoría | Cantidad | Descripción |
|-----------|----------|-------------|
| Autenticación | 5 | Login, registro, recuperación de contraseña |
| Trabajos | 12+ | Gestión de ofertas y postulaciones |
| Cursos | 28+ | Sistema completo de cursos y evaluaciones |
| Instituciones | 18+ | Gestión de instituciones y estudiantes |
| Empresas | 18+ | Gestión de empresas y reclutamiento |
| Emprendimiento | 14+ | Negocios, planes, networking, social |
| Postulaciones Abiertas | 8+ | Promoción juvenil |
| Archivos | 9+ | Subida y gestión de archivos |
| Mensajería | 4+ | Sistema de mensajes |
| Analíticas | 6+ | Métricas y reportes |
| Certificados | 5+ | Generación y gestión |
| Admin | 13+ | Panel administrativo |
| Otros | 11+ | Búsqueda, noticias, recursos |

### Endpoints Críticos por Módulo

#### Autenticación
```http
POST   /api/auth/register
POST   /api/auth/forgot-password
POST   /api/auth/reset-password
POST   /api/auth/change-password
GET    /api/auth/[...nextauth]
POST   /api/auth/[...nextauth]
```

#### Sistema de Trabajos
```http
GET    /api/jobs?search=&salaryMin=&salaryMax=&workType=&modality=&location=
POST   /api/jobs
GET    /api/jobs/[id]
PUT    /api/jobs/[id]
DELETE /api/jobs/[id]
GET    /api/jobs/bookmarked
POST   /api/jobs/[id]/bookmark

POST   /api/applications
GET    /api/applications?status=
GET    /api/applications/[id]
PUT    /api/applications/[id]
DELETE /api/applications/[id]

GET    /api/candidates?jobId=
GET    /api/candidates/[id]
```

#### Sistema de Cursos
```http
GET    /api/courses?category=&level=&search=
POST   /api/courses
GET    /api/courses/[id]
PUT    /api/courses/[id]
DELETE /api/courses/[id]
POST   /api/courses/[id]/enroll
GET    /api/courses/[id]/progress

GET    /api/courses/[courseId]/modules
POST   /api/courses/[courseId]/modules
GET    /api/courses/[courseId]/modules/[moduleId]
PUT    /api/courses/[courseId]/modules/[moduleId]
DELETE /api/courses/[courseId]/modules/[moduleId]

GET    /api/courses/[courseId]/modules/[moduleId]/lessons
POST   /api/courses/[courseId]/modules/[moduleId]/lessons
GET    /api/lessons/[id]
PUT    /api/lessons/[id]
DELETE /api/lessons/[id]
POST   /api/lessons/[id]/complete

GET    /api/courses/[courseId]/quizzes
POST   /api/courses/[courseId]/quizzes
GET    /api/quizzes/[id]
POST   /api/quizzes/[id]/attempts
GET    /api/quizzes/attempts/[attemptId]

GET    /api/courses/categories
GET    /api/courses/analytics
POST   /api/courses/[id]/certificate
```

#### Hub de Emprendimiento
```http
GET    /api/entrepreneurship/entrepreneurships?industry=&stage=&search=
POST   /api/entrepreneurship/entrepreneurships
GET    /api/entrepreneurship/entrepreneurships/[id]
PUT    /api/entrepreneurship/entrepreneurships/[id]
DELETE /api/entrepreneurship/entrepreneurships/[id]

GET    /api/entrepreneurship/business-plans
POST   /api/entrepreneurship/business-plans
GET    /api/entrepreneurship/business-plans/[id]
PUT    /api/entrepreneurship/business-plans/[id]
GET    /api/entrepreneurship/business-plans/[id]/export

GET    /api/entrepreneurship/posts?type=&authorId=
POST   /api/entrepreneurship/posts
GET    /api/entrepreneurship/posts/[id]
POST   /api/entrepreneurship/posts/[id]/like
DELETE /api/entrepreneurship/posts/[id]/like
POST   /api/entrepreneurship/posts/[id]/comments
GET    /api/entrepreneurship/posts/[id]/comments

GET    /api/entrepreneurship/connections?status=
POST   /api/entrepreneurship/connections
PUT    /api/entrepreneurship/connections/[id]

GET    /api/entrepreneurship/resources?type=&category=
```

#### Gestión de Instituciones
```http
GET    /api/institutions?type=
POST   /api/institutions
GET    /api/institutions/[id]
PUT    /api/institutions/[id]
DELETE /api/institutions/[id]

GET    /api/institutions/[id]/courses
POST   /api/institutions/[id]/courses
GET    /api/institutions/[id]/students
GET    /api/institutions/[id]/enrollments?status=&courseId=
GET    /api/institutions/[id]/analytics
GET    /api/institutions/[id]/reports?startDate=&endDate=
```

#### Gestión de Empresas
```http
GET    /api/companies?industry=&size=
POST   /api/companies
GET    /api/companies/[id]
PUT    /api/companies/[id]
DELETE /api/companies/[id]

GET    /api/companies/[id]/jobs?status=
POST   /api/companies/[id]/jobs
GET    /api/companies/[id]/applications?status=&jobId=
GET    /api/companies/[id]/employees
POST   /api/companies/[id]/employees
PUT    /api/companies/[id]/employees/[employeeId]

GET    /api/companies/[id]/analytics
GET    /api/companies/[id]/hiring-metrics
```

#### Postulaciones Abiertas
```http
GET    /api/youth-applications?status=&search=
POST   /api/youth-applications
GET    /api/youth-applications/[id]
PUT    /api/youth-applications/[id]
DELETE /api/youth-applications/[id]

POST   /api/youth-applications/[id]/interests
GET    /api/youth-applications/[id]/interests
DELETE /api/youth-applications/[id]/interests/[interestId]
```

#### Gestión de Archivos
```http
POST   /api/files/upload
POST   /api/files/chunked-upload
POST   /api/files/finalize-upload
GET    /api/files/minio/presigned?key=&bucket=
POST   /api/files/minio/upload
GET    /api/files/minio/status
POST   /api/cv/upload
POST   /api/cover-letter/upload
GET    /api/files/[...path]
```

#### Mensajería
```http
GET    /api/messages?contextType=&contextId=&userId=
POST   /api/messages
GET    /api/messages/conversations
GET    /api/messages/[id]
PUT    /api/messages/[id]
DELETE /api/messages/[id]
```

#### Analíticas
```http
GET    /api/analytics?startDate=&endDate=
GET    /api/courses/analytics?institutionId=
GET    /api/courses/analytics/reports?courseId=&startDate=&endDate=
GET    /api/company/analytics?companyId=
GET    /api/profiles/analytics?userId=
GET    /api/instructor/analytics?instructorId=
```

#### Certificados
```http
GET    /api/certificates?userId=&courseId=
POST   /api/certificates/generate
GET    /api/certificates/[id]
GET    /api/certificates/[id]/download
POST   /api/courses/[id]/certificate
```

#### Panel Administrativo
```http
GET    /api/admin/companies?status=
GET    /api/admin/pending-companies
POST   /api/admin/pending-companies/[id]/approve
POST   /api/admin/pending-companies/[id]/reject

GET    /api/admin/institutions?status=
GET    /api/admin/pending-institutions
POST   /api/admin/pending-institutions/[id]/approve
POST   /api/admin/pending-institutions/[id]/reject

GET    /api/admin/users?role=&status=&search=
GET    /api/admin/users/[id]
PUT    /api/admin/users/[id]
DELETE /api/admin/users/[id]

GET    /api/admin/stats
```

#### Búsqueda Global
```http
GET    /api/search?q=&type=&filters=
GET    /api/search/suggestions?q=
GET    /api/search/popular
```

### Convenciones de API

**Autenticación:**
- Todas las rutas protegidas requieren header: `Authorization: Bearer <JWT>`
- El token se obtiene tras login exitoso

**Códigos de Respuesta:**
- `200` - Éxito
- `201` - Creado
- `400` - Error de validación
- `401` - No autenticado
- `403` - No autorizado (sin permisos)
- `404` - No encontrado
- `500` - Error interno del servidor

**Formato de Respuesta:**
```json
{
  "success": true,
  "data": { /* datos */ },
  "message": "Mensaje opcional"
}
```

**Formato de Error:**
```json
{
  "success": false,
  "error": "Mensaje de error",
  "details": { /* detalles opcionales */ }
}
```

---

## Modelo de Datos

### Diagrama de Relaciones (ER Simplificado)

```
┌─────────────┐
│    User     │◄──────────┐
│  (4 roles)  │           │
└──────┬──────┘           │
       │                  │
       │ 1:1              │
       ▼                  │
┌─────────────┐           │
│   Profile   │           │
│  (extended) │           │
└──────┬──────┘           │
       │                  │
       │ 1:N              │
       ▼                  │
┌─────────────┐           │
│ Institution │           │
│             │           │
└──────┬──────┘           │
       │                  │
       │ 1:N              │
       ▼                  │
┌─────────────┐           │
│   Course    │           │
└──────┬──────┘           │
       │                  │
       │ 1:N              │
       ▼                  │
┌─────────────┐           │
│CourseModule │           │
└──────┬──────┘           │
       │                  │
       │ 1:N              │
       ▼                  │
┌─────────────┐           │
│   Lesson    │           │
└──────┬──────┘           │
       │                  │
       │ 1:N              │
       ▼                  │
┌─────────────┐           │
│    Quiz     │           │
└─────────────┘           │
       │                  │
       │ 1:N              │
       ▼                  │
┌─────────────┐           │
│ QuizAttempt │           │
└─────────────┘           │
       │                  │
       │ N:1              │
       └──────────────────┘

┌─────────────┐
│   Company   │◄──────────┐
└──────┬──────┘           │
       │                  │
       │ 1:N              │
       ▼                  │
┌─────────────┐           │
│  JobOffer   │           │
└──────┬──────┘           │
       │                  │
       │ 1:N              │
       ▼                  │
┌─────────────┐           │
│JobApplication│          │
└─────────────┘           │
       │                  │
       │ N:1              │
       └──────────────────┘

┌─────────────┐
│Entrepreneurship│
└──────┬──────┘
       │
       │ 1:1
       ▼
┌─────────────┐
│BusinessPlan │
└─────────────┘

┌─────────────┐
│   User A    │
└──────┬──────┘
       │
       │ N:N (via EntrepreneurshipConnection)
       ▼
┌─────────────┐
│   User B    │
└─────────────┘
```

### Modelos Principales (Resumen)

#### 1. User
```prisma
model User {
  id                Int          @id @default(autoincrement())
  email             String       @unique
  password          String
  name              String?
  role              UserRole     @default(YOUTH)
  emailVerified     DateTime?
  createdAt         DateTime     @default(now())
  updatedAt         DateTime     @updatedAt

  profile           Profile?
  jobApplications   JobApplication[]
  entrepreneurships Entrepreneurship[]
  messages          Message[]
  // ... más relaciones
}

enum UserRole {
  YOUTH
  COMPANIES
  INSTITUTION
  SUPERADMIN
}
```

#### 2. Profile
```prisma
model Profile {
  id              Int       @id @default(autoincrement())
  userId          Int       @unique
  firstName       String?
  lastName        String?
  birthDate       DateTime?
  phone           String?
  location        String?
  biography       String?

  // Campos profesionales
  title           String?
  industry        String?
  yearsExperience Int?
  skills          Json?      // Array de skills con nivel
  languages       Json?      // Array de idiomas con nivel

  // CV y documentos
  cvUrl           String?
  coverLetterUrl  String?
  portfolioUrl    String?

  // Redes sociales
  linkedinUrl     String?
  githubUrl       String?
  websiteUrl      String?

  // JSON extensibles
  workExperience  Json?      // Array de experiencias
  education       Json?      // Array de educación
  projects        Json?      // Array de proyectos

  user            User      @relation(fields: [userId], references: [id])

  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt
}
```

#### 3. JobOffer
```prisma
model JobOffer {
  id              Int           @id @default(autoincrement())
  title           String
  description     String
  companyId       Int

  // Detalles del trabajo
  workType        WorkType
  modality        WorkModality
  experienceLevel ExperienceLevel

  // Salario
  salaryMin       Decimal?
  salaryMax       Decimal?
  salaryCurrency  String        @default("BOB")

  // Ubicación
  location        String?
  municipality    String?
  latitude        Float?
  longitude       Float?

  // Requisitos
  requirements    String[]
  skills          String[]
  benefits        String[]

  // Fechas
  applicationDeadline DateTime?
  status          JobStatus     @default(ACTIVE)

  company         Company       @relation(fields: [companyId], references: [id])
  applications    JobApplication[]
  questions       JobQuestion[]

  createdAt       DateTime      @default(now())
  updatedAt       DateTime      @updatedAt
}
```

#### 4. Course
```prisma
model Course {
  id              Int           @id @default(autoincrement())
  title           String
  description     String
  institutionId   Int
  instructorId    Int?

  // Categorización
  category        CourseCategory
  level           CourseLevel
  duration        Int?          // minutos

  // Contenido
  thumbnailUrl    String?
  prerequisites   String[]
  learningObjectives String[]

  // Configuración
  maxStudents     Int?
  price           Decimal?      @default(0)
  status          CourseStatus  @default(DRAFT)

  // Relaciones
  institution     Institution   @relation(fields: [institutionId], references: [id])
  modules         CourseModule[]
  enrollments     CourseEnrollment[]
  certificates    Certificate[]

  createdAt       DateTime      @default(now())
  updatedAt       DateTime      @updatedAt
}
```

#### 5. Entrepreneurship
```prisma
model Entrepreneurship {
  id              Int       @id @default(autoincrement())
  userId          Int
  businessName    String
  description     String

  // Clasificación
  industry        String
  subcategory     String?
  stage           BusinessStage

  // Información
  logoUrl         String?
  websiteUrl      String?
  location        String?
  foundedDate     DateTime?

  // Métricas
  employeesCount  Int?
  annualRevenue   Decimal?

  // Redes sociales
  socialLinks     Json?

  user            User      @relation(fields: [userId], references: [id])
  businessPlan    BusinessPlan?
  posts           EntrepreneurshipPost[]
  connections     EntrepreneurshipConnection[]

  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt
}
```

#### 6. BusinessPlan
```prisma
model BusinessPlan {
  id                    Int       @id @default(autoincrement())
  entrepreneurshipId    Int       @unique

  // Business Model Canvas (JSON)
  valueProposition      Json?
  customerSegments      Json?
  channels              Json?
  customerRelationships Json?
  revenueStreams        Json?
  keyResources          Json?
  keyActivities         Json?
  keyPartnerships       Json?
  costStructure         Json?

  // Proyecciones Financieras (JSON)
  financialProjections  Json?     // 36 meses

  // Triple Impacto (JSON)
  socialImpact          Json?
  environmentalImpact   Json?
  economicImpact        Json?

  // Metadatos
  completionPercentage  Int       @default(0)
  lastEditedSection     String?

  entrepreneurship      Entrepreneurship @relation(fields: [entrepreneurshipId], references: [id])

  createdAt             DateTime  @default(now())
  updatedAt             DateTime  @updatedAt
}
```

### Enums Principales

```prisma
enum UserRole {
  YOUTH
  COMPANIES
  INSTITUTION
  SUPERADMIN
}

enum WorkType {
  FULL_TIME
  PART_TIME
  INTERNSHIP
  VOLUNTEER
  FREELANCE
}

enum WorkModality {
  ON_SITE
  REMOTE
  HYBRID
}

enum ApplicationStatus {
  SENT
  UNDER_REVIEW
  PRE_SELECTED
  HIRED
  REJECTED
}

enum CourseCategory {
  SOFT_SKILLS
  TECHNICAL
  ENTREPRENEURSHIP
  DIGITAL_LITERACY
  LEADERSHIP
  COMMUNICATION
  FINANCE
  MARKETING
}

enum CourseLevel {
  BEGINNER
  INTERMEDIATE
  ADVANCED
}

enum LessonType {
  VIDEO
  AUDIO
  TEXT
  QUIZ
  EXERCISE
  DOCUMENT
  INTERACTIVE
}

enum BusinessStage {
  IDEA
  STARTUP
  GROWING
  ESTABLISHED
}

enum ConnectionStatus {
  PENDING
  ACCEPTED
  DECLINED
  BLOCKED
}

enum PostType {
  TEXT
  IMAGE
  VIDEO
  LINK
  POLL
  EVENT
  QUESTION
  ACHIEVEMENT
}
```

---

## Seguridad y Autenticación

### Sistema de Autenticación

**Implementación:** NextAuth.js con estrategia JWT

**Flujo de Login:**
```
1. Usuario envía email + password → POST /api/auth/[...nextauth]
2. Sistema verifica credenciales con bcrypt
3. Rate limiter valida intentos de login (máx. 5 en 15 min)
4. Se genera JWT con datos de usuario
5. Token se almacena en cookie httpOnly
6. Frontend recibe sesión con rol e información
```

**Composición del Token JWT:**
```json
{
  "id": 123,
  "email": "user@example.com",
  "name": "Nombre Usuario",
  "role": "YOUTH",
  "institutionId": null,
  "companyId": null,
  "iat": 1234567890,
  "exp": 1237159890
}
```

### Control de Acceso Basado en Roles (RBAC)

**Matriz de Permisos:**

| Recurso | YOUTH | COMPANIES | INSTITUTION | SUPERADMIN |
|---------|-------|-----------|-------------|------------|
| Ver ofertas de trabajo | ✅ | ✅ | ✅ | ✅ |
| Postular a trabajos | ✅ | ❌ | ❌ | ❌ |
| Publicar trabajos | ❌ | ✅ | ❌ | ✅ |
| Ver candidatos | ❌ | ✅ | ❌ | ✅ |
| Inscribirse en cursos | ✅ | ❌ | ❌ | ✅ |
| Crear cursos | ❌ | ❌ | ✅ | ✅ |
| Gestionar institución | ❌ | ❌ | ✅ | ✅ |
| Crear emprendimiento | ✅ | ❌ | ❌ | ✅ |
| Aprobar empresas | ❌ | ❌ | ❌ | ✅ |
| Gestionar usuarios | ❌ | ❌ | ❌ | ✅ |

**Implementación en Middleware:** [src/middleware.ts](src/middleware.ts)

```typescript
// Rutas protegidas por rol
const protectedRoutes = {
  '/dashboard': ['YOUTH', 'COMPANIES', 'INSTITUTION', 'SUPERADMIN'],
  '/admin': ['SUPERADMIN'],
  '/companies': ['COMPANIES', 'SUPERADMIN'],
  '/institutions': ['INSTITUTION', 'SUPERADMIN'],
  '/entrepreneurship': ['YOUTH', 'SUPERADMIN'],
  // ... más rutas
}
```

### Seguridad de Contraseñas

**Requisitos de Contraseña:**
- Mínimo 8 caracteres
- Al menos una mayúscula
- Al menos una minúscula
- Al menos un número
- Al menos un carácter especial
- No puede contener el email del usuario

**Hashing:**
- Algoritmo: bcrypt
- Salt rounds: 10
- Comparación constant-time

**Servicio:** [src/lib/password-validator.ts](src/lib/password-validator.ts)

### Rate Limiting

**Login Rate Limiting:**
- Máximo 5 intentos en 15 minutos por IP
- Bloqueo temporal tras exceder límite
- Limpieza automática de contadores expirados
- Logging de intentos bloqueados

**Implementación:** [src/lib/rate-limiter.ts](src/lib/rate-limiter.ts:146)

**Almacenamiento:** En memoria (desarrollo), Redis (producción)

### Security Logger

**Eventos Registrados:**
- Login exitoso
- Login fallido
- Bloqueo por rate limit
- Cambio de contraseña
- Creación de cuenta
- Acceso denegado (403)
- Intentos de acceso no autorizado

**Formato de Log:**
```json
{
  "timestamp": "2025-10-27T10:30:00Z",
  "level": "warning",
  "event": "login_failed",
  "userId": null,
  "email": "user@example.com",
  "ip": "192.168.1.1",
  "userAgent": "Mozilla/5.0...",
  "details": {
    "reason": "invalid_password",
    "attempts": 3
  }
}
```

**Servicio:** [src/lib/security-logger.ts](src/lib/security-logger.ts)

### Validación y Sanitización de Inputs

**Validación con Zod:**
- Schemas para todos los formularios
- Validación en cliente y servidor
- Type inference automático
- Mensajes de error personalizados

**Sanitización con DOMPurify:**
- Limpieza de HTML en inputs
- Prevención de XSS
- Whitelist de tags permitidos
- Sanitización isomórfica (cliente/servidor)

**Servicio:** [src/lib/input-validator.ts](src/lib/input-validator.ts)

### Headers de Seguridad

**Configuración en next.config.ts:**

```typescript
headers: [
  {
    key: 'X-Frame-Options',
    value: 'SAMEORIGIN'  // Previene clickjacking
  },
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff'  // Previene MIME sniffing
  },
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=63072000; includeSubDomains; preload'
  },
  {
    key: 'X-XSS-Protection',
    value: '1; mode=block'
  },
  {
    key: 'Referrer-Policy',
    value: 'strict-origin-when-cross-origin'
  },
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=()'
  }
]
```

### Protección de Datos Sensibles

**Variables de Entorno:**
- Almacenadas en `.env.local` (gitignored)
- Validadas al inicio con Zod
- Nunca expuestas al frontend
- Rotación periódica de secrets

**Datos en Base de Datos:**
- Contraseñas hasheadas con bcrypt
- Información sensible en campos seguros
- No se loguean datos personales
- Backups encriptados

**Almacenamiento de Archivos:**
- URLs pre-firmadas para acceso temporal
- Buckets privados por defecto
- Políticas de acceso restrictivas
- Expiración automática de URLs

### Protección CSRF

**NextAuth.js CSRF Protection:**
- Token CSRF automático en requests de autenticación
- Verificación de origin header
- Cookie httpOnly y secure

### CORS Policy

**Configuración:**
- Dominios permitidos definidos
- Métodos permitidos: GET, POST, PUT, DELETE
- Headers permitidos configurados
- Credentials permitidas para mismo origen

---

## Despliegue y Configuración

### Arquitectura de Despliegue

**Ambiente de Desarrollo:**
```
localhost:3000      → Next.js App
localhost:5432      → PostgreSQL
localhost:6379      → Redis
localhost:9000      → MinIO API
localhost:9001      → MinIO Console
```

**Ambiente de Producción:**
```
https://cemse-dev.gobernaciondecochabamba.bo → Next.js App (Docker)
PostgreSQL RDS → Base de datos gestionada
Redis Cluster → Caché distribuido
MinIO/S3 → Almacenamiento de objetos
```

### Requisitos del Sistema

**Desarrollo:**
- Node.js 20.x o superior
- pnpm 8.x o superior
- Docker 24.x y Docker Compose
- 8 GB RAM mínimo
- 10 GB espacio en disco

**Producción:**
- Node.js 20.x LTS
- PostgreSQL 15.x
- Redis 7.x
- MinIO o S3-compatible storage
- 4 vCPUs mínimo
- 8 GB RAM mínimo
- 50 GB almacenamiento (base de datos + archivos)

### Variables de Entorno

**Archivo `.env.local` (Desarrollo):**

```bash
# Database
DATABASE_URL="postgresql://cemse:password@localhost:5432/cemse"
DIRECT_URL="postgresql://cemse:password@localhost:5432/cemse"

# NextAuth
NEXTAUTH_SECRET="tu-secret-super-seguro-aqui"
NEXTAUTH_URL="http://localhost:3000"

# Redis
REDIS_URL="redis://localhost:6379"

# MinIO
MINIO_ENDPOINT="localhost"
MINIO_PORT="9000"
MINIO_USE_SSL="false"
MINIO_ACCESS_KEY="minioadmin"
MINIO_SECRET_KEY="minioadmin"
MINIO_BUCKET_NAME="cemse-uploads"
NEXT_PUBLIC_MINIO_ENDPOINT="http://localhost:9000"

# Email (Resend)
RESEND_API_KEY="tu-api-key-de-resend"
RESEND_FROM_EMAIL="noreply@tudominio.com"

# App
NEXT_PUBLIC_APP_URL="http://localhost:3000"
NODE_ENV="development"

# Feature Flags (opcional)
ENABLE_RATE_LIMITING="true"
ENABLE_EMAIL_NOTIFICATIONS="false"
```

**Producción (Secrets en Servidor):**
- Usar gestor de secrets (AWS Secrets Manager, Vault, etc.)
- Variables sensibles nunca en código
- Rotación periódica de secrets

### Comandos de Instalación y Ejecución

#### Primera Instalación (Desarrollo)

```bash
# 1. Clonar el repositorio
git clone https://github.com/figuu/cemse.git
cd cemse

# 2. Instalar dependencias
pnpm install

# 3. Configurar variables de entorno
cp .env.example .env.local
# Editar .env.local con tus valores

# 4. Levantar infraestructura (Docker)
pnpm run docker:up

# 5. Esperar que servicios estén listos (30 segundos)
pnpm run docker:status

# 6. Inicializar MinIO
pnpm run minio:init

# 7. Generar Prisma Client
pnpm run db:generate

# 8. Aplicar migraciones
pnpm run db:migrate

# 9. (Opcional) Poblar base de datos con datos de prueba
pnpm run db:seed

# 10. Iniciar aplicación
pnpm run dev
```

**La aplicación estará disponible en:** http://localhost:3000

#### Credenciales Iniciales del Sistema

El script de seed (`prisma/seed.ts`) crea el siguiente usuario administrador inicial:

**Usuario Administrador:**
- **Email:** `admin@demo.com`
- **Contraseña:** `12345678`
- **Rol:** `SUPERADMIN`
- **Nombre:** Administrador Sistema

> **Nota:** El script de seed actual solo crea este usuario administrador. Todos los demás datos de prueba (instituciones, empresas, jóvenes, cursos, ofertas de trabajo) están comentados en el archivo `seed.ts` y NO se crean automáticamente.

> **Importante:** Se recomienda cambiar estas credenciales inmediatamente después del primer inicio de sesión en ambiente de producción.

#### Comandos de Desarrollo

```bash
# Desarrollo normal
pnpm run dev

# Desarrollo con limpieza de caché
pnpm run dev:clean

# Linting
pnpm run lint

# Testing
pnpm run test
pnpm run test:watch
pnpm run test:coverage

# Base de datos
pnpm run db:studio        # Abrir Prisma Studio
pnpm run db:generate      # Regenerar Prisma Client
pnpm run db:push          # Sync schema sin migración
pnpm run db:migrate       # Crear y aplicar migración
pnpm run db:reset         # Reset completo + seed

# Docker
pnpm run docker:up        # Levantar servicios
pnpm run docker:down      # Detener servicios
pnpm run docker:logs      # Ver logs
pnpm run docker:clean     # Limpiar todo (incluye volúmenes)
pnpm run docker:status    # Ver estado de servicios

# MinIO
pnpm run minio:init       # Crear buckets
pnpm run minio:test       # Probar conexión
```

#### Build de Producción

```bash
# Build optimizado
pnpm run build

# Iniciar en producción
pnpm run start

# Build sin linting (CI/CD)
pnpm run build:no-lint
```

### Configuración de Docker

**Archivo `docker-compose.yml`:**

```yaml
version: '3.8'

services:
  postgres:
    image: postgres:15-alpine
    container_name: cemse-postgres
    environment:
      POSTGRES_USER: cemse
      POSTGRES_PASSWORD: password
      POSTGRES_DB: cemse
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
    restart: unless-stopped

  redis:
    image: redis:7-alpine
    container_name: cemse-redis
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
    restart: unless-stopped

  minio:
    image: minio/minio:latest
    container_name: cemse-minio
    ports:
      - "9000:9000"
      - "9001:9001"
    volumes:
      - minio_data:/data
    environment:
      MINIO_ROOT_USER: minioadmin
      MINIO_ROOT_PASSWORD: minioadmin
    command: server /data --console-address ":9001"
    restart: unless-stopped

volumes:
  postgres_data:
  redis_data:
  minio_data:
```

### Dockerfile para Producción

```dockerfile
FROM node:20-alpine AS base

# Dependencias
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN npm install -g pnpm
RUN pnpm install --frozen-lockfile

# Build
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm install -g pnpm
RUN pnpm run db:generate
RUN pnpm run build

# Producción
FROM base AS runner
WORKDIR /app
ENV NODE_ENV production
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs
EXPOSE 3000
ENV PORT 3000

CMD ["node", "server.js"]
```

### Script de Despliegue Automatizado

**Archivo `manage.sh`:**

```bash
#!/bin/bash

case "$1" in
  start)
    docker-compose up -d
    ;;
  stop)
    docker-compose down
    ;;
  restart)
    docker-compose restart
    ;;
  deploy)
    git pull origin main
    pnpm install
    pnpm run db:generate
    pnpm run db:migrate
    pnpm run build
    pm2 restart cemse
    ;;
  status)
    docker-compose ps
    ;;
  logs)
    docker-compose logs -f
    ;;
  backup)
    # Backup de PostgreSQL
    docker exec cemse-postgres pg_dump -U cemse cemse > backup_$(date +%Y%m%d_%H%M%S).sql
    ;;
  health)
    curl -f http://localhost:3000/api/health || exit 1
    ;;
  *)
    echo "Uso: $0 {start|stop|restart|deploy|status|logs|backup|health}"
    exit 1
    ;;
esac
```

**Uso:**
```bash
chmod +x manage.sh
./manage.sh start      # Iniciar servicios
./manage.sh deploy     # Desplegar nueva versión
./manage.sh backup     # Hacer backup
./manage.sh health     # Verificar salud
```

### Estrategia de Despliegue

**CI/CD Pipeline (GitHub Actions ejemplo):**

```yaml
name: Deploy CEMSE

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Setup Node
        uses: actions/setup-node@v3
        with:
          node-version: '20'

      - name: Install pnpm
        run: npm install -g pnpm

      - name: Install dependencies
        run: pnpm install

      - name: Run tests
        run: pnpm run test

      - name: Build
        run: pnpm run build
        env:
          DATABASE_URL: ${{ secrets.DATABASE_URL }}
          NEXTAUTH_SECRET: ${{ secrets.NEXTAUTH_SECRET }}

      - name: Deploy to server
        uses: appleboy/ssh-action@master
        with:
          host: ${{ secrets.HOST }}
          username: ${{ secrets.USERNAME }}
          key: ${{ secrets.SSH_KEY }}
          script: |
            cd /opt/cemse
            ./manage.sh deploy
```

### Monitoreo y Salud

**Health Check Endpoint:** `/api/health`

```typescript
// Verificación de servicios
{
  "status": "healthy",
  "timestamp": "2025-10-27T10:30:00Z",
  "services": {
    "database": "connected",
    "redis": "connected",
    "minio": "connected"
  },
  "uptime": 86400
}
```

### Backup y Recuperación

**Backup Diario Automatizado:**
```bash
# Crontab
0 2 * * * /opt/cemse/manage.sh backup
```

**Restauración:**
```bash
# Restaurar PostgreSQL
docker exec -i cemse-postgres psql -U cemse cemse < backup_20251027_020000.sql
```

---

## Capturas y Demostraciones

### Capturas de Pantalla

> **Nota:** Las capturas de pantalla se pueden agregar en la carpeta `/docs/screenshots/` del proyecto.

**Capturas Recomendadas:**

1. **Dashboard Principal (YOUTH)**
   - Ubicación sugerida: `docs/screenshots/01-dashboard-youth.png`
   - Muestra: Widgets de trabajos recomendados, cursos en progreso, métricas

2. **Búsqueda de Trabajos**
   - Ubicación sugerida: `docs/screenshots/02-job-search.png`
   - Muestra: Filtros avanzados, lista de ofertas, mapa de ubicaciones

3. **Detalle de Oferta Laboral**
   - Ubicación sugerida: `docs/screenshots/03-job-detail.png`
   - Muestra: Descripción completa, requisitos, botón de postulación

4. **Catálogo de Cursos**
   - Ubicación sugerida: `docs/screenshots/04-course-catalog.png`
   - Muestra: Cursos con thumbnails, filtros por categoría, niveles

5. **Vista de Lección (Video)**
   - Ubicación sugerida: `docs/screenshots/05-lesson-video.png`
   - Muestra: Reproductor de video, navegación de lecciones, progreso

6. **Quiz en Curso**
   - Ubicación sugerida: `docs/screenshots/06-course-quiz.png`
   - Muestra: Preguntas, opciones, timer, botones

7. **Certificado Generado**
   - Ubicación sugerida: `docs/screenshots/07-certificate.png`
   - Muestra: Certificado en formato PDF con diseño profesional

8. **Hub de Emprendimiento**
   - Ubicación sugerida: `docs/screenshots/08-entrepreneurship-hub.png`
   - Muestra: Lista de negocios, feed social, navegación

9. **Constructor de Plan de Negocios**
   - Ubicación sugerida: `docs/screenshots/09-business-plan-builder.png`
   - Muestra: Business Model Canvas, secciones editables

10. **Proyecciones Financieras**
    - Ubicación sugerida: `docs/screenshots/10-financial-projections.png`
    - Muestra: Gráficas de ingresos/gastos, tabla de proyección 3 años

11. **Dashboard de Empresa**
    - Ubicación sugerida: `docs/screenshots/11-company-dashboard.png`
    - Muestra: Ofertas activas, postulaciones recibidas, métricas

12. **Gestión de Candidatos**
    - Ubicación sugerida: `docs/screenshots/12-candidates-management.png`
    - Muestra: Lista de candidatos, filtros por estado, perfiles

13. **Dashboard de Institución**
    - Ubicación sugerida: `docs/screenshots/13-institution-dashboard.png`
    - Muestra: Cursos creados, estudiantes, analíticas

14. **Panel Administrativo**
    - Ubicación sugerida: `docs/screenshots/14-admin-panel.png`
    - Muestra: Aprobaciones pendientes, estadísticas globales

15. **Constructor de CV**
    - Ubicación sugerida: `docs/screenshots/15-cv-builder.png`
    - Muestra: Formulario de CV, plantillas, preview

16. **Sistema de Mensajería**
    - Ubicación sugerida: `docs/screenshots/16-messaging.png`
    - Muestra: Lista de conversaciones, chat activo

17. **Analíticas y Reportes**
    - Ubicación sugerida: `docs/screenshots/17-analytics.png`
    - Muestra: Gráficas, KPIs, tendencias

18. **Vista Móvil (Responsive)**
    - Ubicación sugerida: `docs/screenshots/18-mobile-view.png`
    - Muestra: Diseño responsive en dispositivo móvil

### Video Demostrativo

**Video Corto del Sistema (3-5 minutos):**

**Estructura Sugerida:**
1. **Intro (0:00-0:15)**
   - Logo y nombre del proyecto
   - Objetivo del sistema

2. **Login y Dashboard (0:15-0:45)**
   - Proceso de login
   - Dashboard personalizado por rol
   - Navegación principal

3. **Módulo de Trabajos (0:45-1:30)**
   - Búsqueda de ofertas con filtros
   - Visualización en mapa
   - Postulación a oferta
   - Vista de empresa: gestión de candidatos

4. **Módulo de Cursos (1:30-2:15)**
   - Catálogo de cursos
   - Inscripción a curso
   - Navegación de lecciones
   - Quiz de evaluación
   - Certificado generado

5. **Hub de Emprendimiento (2:15-3:00)**
   - Creación de perfil de negocio
   - Constructor de plan de negocios
   - Proyecciones financieras
   - Red social de emprendedores

6. **Panel Administrativo (3:00-3:30)**
   - Aprobación de empresas
   - Visualización de estadísticas
   - Gestión de usuarios

7. **Cierre (3:30-3:45)**
   - Resumen de características
   - Tecnologías usadas
   - Información de contacto

**Ubicación Sugerida:** `docs/videos/cemse-demo.mp4`

**Enlace Alternativo:** YouTube (privado/no listado)

---

## Repositorio y Enlaces

### Repositorio de Código

**GitHub Repository:**
- **URL:** https://github.com/figuu/cemse.git
- **Rama Principal:** `master`
- **Ramas de Desarrollo:**
  - `develop` - Rama de desarrollo activo
  - `feature/*` - Ramas de features
  - `hotfix/*` - Ramas de hotfixes

**Estructura del Repositorio:**
```
cemse/
├── .github/
│   └── workflows/        # GitHub Actions CI/CD
├── docs/
│   ├── screenshots/      # Capturas de pantalla
│   ├── videos/          # Videos demostrativos
│   └── api/             # Documentación adicional de API
├── prisma/
│   ├── schema.prisma    # Schema de base de datos
│   ├── migrations/      # Migraciones
│   └── seed.ts          # Datos de prueba
├── public/              # Archivos estáticos
├── scripts/             # Scripts de utilidad
├── src/
│   ├── app/             # Next.js App Router
│   ├── components/      # Componentes React
│   ├── hooks/           # Custom hooks
│   ├── lib/             # Servicios y utilidades
│   └── types/           # Definiciones TypeScript
├── .env.example         # Ejemplo de variables de entorno
├── docker-compose.yml   # Configuración Docker
├── Dockerfile           # Imagen de producción
├── package.json         # Dependencias
├── tsconfig.json        # Configuración TypeScript
├── tailwind.config.ts   # Configuración Tailwind
├── next.config.ts       # Configuración Next.js
├── manage.sh            # Script de gestión
└── README.md            # Documentación principal
```

### Documentación Adicional

**Dentro del Repositorio:**
- [README.md](README.md) - Guía de inicio rápido
- [TECHNICAL_OVERVIEW.md](TECHNICAL_OVERVIEW.md) - Overview técnico detallado
- [QUICK_REFERENCE.md](QUICK_REFERENCE.md) - Referencia rápida
- [DOCUMENTACION_TECNICA.md](DOCUMENTACION_TECNICA.md) - Este documento

### Enlaces Útiles

**Tecnologías Principales:**
- [Next.js Documentation](https://nextjs.org/docs)
- [React Documentation](https://react.dev)
- [Prisma Documentation](https://www.prisma.io/docs)
- [NextAuth.js Documentation](https://next-auth.js.org)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Radix UI Documentation](https://www.radix-ui.com/docs/primitives)
- [React Query Documentation](https://tanstack.com/query/latest/docs/framework/react/overview)

**Herramientas:**
- [MinIO Documentation](https://min.io/docs/minio/linux/index.html)
- [Docker Documentation](https://docs.docker.com)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Redis Documentation](https://redis.io/docs/)

### Contacto y Soporte

**Equipo de Desarrollo:**
- **Repositorio de Issues:** https://github.com/figuu/cemse/issues
- **Pull Requests:** https://github.com/figuu/cemse/pulls

**Gobierno de Cochabamba:**
- **Sitio Web:** https://www.gobernaciondecochabamba.bo
- **URL de Aplicación (Dev):** https://cemse-dev.gobernaciondecochabamba.bo

---

## Resumen de Logros

### Funcionalidades Implementadas

✅ **151 endpoints API** funcionales y documentados
✅ **33 modelos de base de datos** con relaciones complejas
✅ **200+ componentes React** reutilizables
✅ **4 roles de usuario** con RBAC completo
✅ **Sistema de autenticación** seguro con JWT
✅ **Bolsa de trabajo** con filtros avanzados y geolocalización
✅ **Plataforma de cursos** con evaluaciones y certificación
✅ **Hub de emprendimiento** con planificación de negocios
✅ **Sistema de mensajería** contextual
✅ **Analíticas y reportes** para todas las entidades
✅ **Gestión de archivos** con MinIO/S3
✅ **Generación de PDFs** (certificados, planes)
✅ **Rate limiting y security logging**
✅ **Diseño responsive** mobile-first
✅ **Docker Compose** para desarrollo
✅ **Scripts de despliegue** automatizados

### Métricas de Calidad

- **Type Safety:** 100% TypeScript
- **Test Coverage:** Testing configurado con Jest
- **Code Quality:** ESLint + Prettier configurados
- **Security:** Headers de seguridad, rate limiting, input validation
- **Performance:** Next.js optimizations, React Query caching
- **Scalability:** Architecture preparada para crecimiento
- **Maintainability:** Código modular y documentado

---

## Próximos Pasos y Mejoras Futuras

### Características Pendientes (Roadmap)

**Corto Plazo (1-3 meses):**
- [ ] Notificaciones push en tiempo real (WebSockets)
- [ ] Sistema de calificaciones y reviews (cursos, empresas)
- [ ] Chat en tiempo real con Socket.io
- [ ] Dashboard de analíticas avanzadas con más visualizaciones
- [ ] Exportación de reportes a Excel/PDF
- [ ] Sistema de badges y gamificación
- [ ] Tests E2E con Playwright

**Medio Plazo (3-6 meses):**
- [ ] App móvil nativa (React Native)
- [ ] Sistema de recomendaciones con IA
- [ ] Integración con LinkedIn para importar perfiles
- [ ] Sistema de video llamadas para entrevistas
- [ ] Marketplace de servicios profesionales
- [ ] Sistema de pagos integrado (pasarelas)
- [ ] Multi-idioma completo (i18n)

**Largo Plazo (6-12 meses):**
- [ ] Machine Learning para matching de candidatos
- [ ] Sistema de mentorías
- [ ] Integración con sistemas gubernamentales
- [ ] APIs públicas para integraciones externas
- [ ] Plataforma de webinars en vivo
- [ ] Sistema de referidos y recompensas
- [ ] Expansión regional a otros departamentos

### Mejoras Técnicas

**Optimización:**
- [ ] Implementar ISR (Incremental Static Regeneration) para páginas públicas
- [ ] Optimizar queries con DataLoader pattern
- [ ] Implementar Redis para caché de queries frecuentes
- [ ] CDN para assets estáticos
- [ ] Image optimization avanzada

**Seguridad:**
- [ ] 2FA (Two-Factor Authentication)
- [ ] OAuth providers (Google, Facebook)
- [ ] Escaneo de vulnerabilidades automatizado
- [ ] Penetration testing
- [ ] GDPR compliance completo

**Monitoreo:**
- [ ] APM (Application Performance Monitoring)
- [ ] Error tracking con Sentry
- [ ] Log aggregation con ELK Stack
- [ ] Uptime monitoring
- [ ] Performance budgets

---

## Conclusión

CEMSE (Emplea y Emprende) es una plataforma web completa y robusta que integra empleabilidad juvenil, capacitación educativa y emprendimiento en un ecosistema digital unificado.

Con **151 endpoints**, **33 modelos de datos**, **200+ componentes** y una arquitectura moderna basada en Next.js 15, Prisma, y PostgreSQL, el sistema está preparado para escalar y evolucionar según las necesidades de la Gobernación de Cochabamba y los usuarios finales.

La plataforma no solo cumple con los requisitos funcionales, sino que también implementa las mejores prácticas de seguridad, rendimiento y mantenibilidad, garantizando una solución sostenible a largo plazo.

---

**Fecha de Documento:** 27 de Octubre, 2025
**Versión:** 1.0
**Autor:** Equipo de Desarrollo CEMSE
**Contacto:** https://github.com/figuu/cemse
