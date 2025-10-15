# Guía Completa de Capturas de Pantalla para Emplea y Emprende

## 📋 Estructura de Directorios Creada

```
tasks/screenshots/
├── auth/              # Autenticación y acceso
├── youth/             # Flujo de usuario joven
├── companies/         # Portal empresarial
├── institutions/      # Panel institucional
├── admin/             # Super administración
└── features/          # Funcionalidades transversales
```

## 🎯 Objetivo

Crear un tour visual completo de la plataforma Emplea y Emprende que documente todas las funcionalidades principales de cada rol de usuario para incluir en el informe técnico LaTeX.

## 📸 Plan de Capturas por Flujo

### 🔐 **FASE 1: Autenticación y Acceso**

#### 1.1 Página Principal
- **URL**: `http://localhost:3000`
- **Archivo**: `tasks/screenshots/auth/landing-page.png`
- **Descripción**: Página pública de inicio con información institucional

#### 1.2 Inicio de Sesión
- **URL**: `http://localhost:3000/sign-in`
- **Archivo**: `tasks/screenshots/auth/sign-in.png`
- **Descripción**: Formulario de login con NextAuth.js

#### 1.3 Registro de Usuario
- **URL**: `http://localhost:3000/sign-up`
- **Archivo**: `tasks/screenshots/auth/sign-up.png`
- **Descripción**: Formulario de registro para los 4 tipos de usuario

---

### 👤 **FASE 2: Usuario Joven (YOUTH) - Flujo Completo**

*Este es el flujo más importante y completo del sistema*

#### 2.1 Dashboard Principal
- **URL**: `/dashboard` (después de login como YOUTH)
- **Archivo**: `tasks/screenshots/youth/dashboard.png`
- **Descripción**: Panel principal con acciones rápidas y estadísticas

#### 2.2 Búsqueda de Empleos
- **URL**: `/jobs`
- **Archivo**: `tasks/screenshots/youth/jobs-search.png`
- **Descripción**: Motor de búsqueda con filtros avanzados

#### 2.3 Detalle de Oferta Laboral
- **URL**: `/jobs/[id]` (cualquier oferta activa)
- **Archivo**: `tasks/screenshots/youth/job-detail.png`
- **Descripción**: Vista completa de oferta con mapa y detalles

#### 2.4 Aplicación a Empleo
- **URL**: `/jobs/[id]/apply`
- **Archivo**: `tasks/screenshots/youth/job-apply.png`
- **Descripción**: Formulario de aplicación con CV y preguntas

#### 2.5 Seguimiento de Aplicaciones
- **URL**: `/applications`
- **Archivo**: `tasks/screenshots/youth/my-applications.png`
- **Descripción**: Panel de estado de postulaciones

#### 2.6 Catálogo de Cursos
- **URL**: `/courses`
- **Archivo**: `tasks/screenshots/youth/courses.png`
- **Descripción**: Exploración de cursos por categorías

#### 2.7 Constructor de CV
- **URL**: `/cv-builder`
- **Archivo**: `tasks/screenshots/youth/cv-builder.png`
- **Descripción**: Herramienta de creación de currículum

#### 2.8 Perfil Personal
- **URL**: `/profile`
- **Archivo**: `tasks/screenshots/youth/profile.png`
- **Descripción**: Gestión de perfil y datos personales

#### 2.9 Hub de Emprendimiento
- **URL**: `/entrepreneurship`
- **Archivo**: `tasks/screenshots/youth/entrepreneurship.png`
- **Descripción**: Red social y recursos para emprendedores

---

### 🏢 **FASE 3: Usuario Empresa (COMPANIES)**

#### 3.1 Dashboard Empresarial
- **URL**: `/dashboard` (después de login como COMPANY)
- **Archivo**: `tasks/screenshots/companies/dashboard.png`
- **Descripción**: Panel de control con métricas de reclutamiento

#### 3.2 Crear Oferta Laboral
- **URL**: `/jobs/create`
- **Archivo**: `tasks/screenshots/companies/create-job.png`
- **Descripción**: Formulario de publicación de empleo

#### 3.3 Gestión de Empleos
- **URL**: `/company` o `/jobs` (vista empresa)
- **Archivo**: `tasks/screenshots/companies/job-management.png`
- **Descripción**: Administración de ofertas publicadas

#### 3.4 Descubrimiento de Talento
- **URL**: `/talent`
- **Archivo**: `tasks/screenshots/companies/talent-discovery.png`
- **Descripción**: Búsqueda proactiva de candidatos

#### 3.5 Perfil de Empresa
- **URL**: `/profile` (vista empresa)
- **Archivo**: `tasks/screenshots/companies/profile.png`
- **Descripción**: Configuración del perfil corporativo

---

### 🏛️ **FASE 4: Usuario Institución (INSTITUTION)**

#### 4.1 Dashboard Institucional
- **URL**: `/dashboard` (después de login como INSTITUTION)
- **Archivo**: `tasks/screenshots/institutions/dashboard.png`
- **Descripción**: Panel con métricas educativas

#### 4.2 Gestión de Usuarios
- **URL**: `/admin/users` (vista institución)
- **Archivo**: `tasks/screenshots/institutions/user-management.png`
- **Descripción**: Administración de usuarios municipales

#### 4.3 Gestión de Cursos
- **URL**: `/courses` (vista institución)
- **Archivo**: `tasks/screenshots/institutions/course-management.png`
- **Descripción**: Administración de contenido educativo

#### 4.4 Gestión de Estudiantes
- **URL**: `/students`
- **Archivo**: `tasks/screenshots/institutions/student-management.png`
- **Descripción**: Seguimiento de progreso estudiantil

---

### ⚙️ **FASE 5: Super Administrador (SUPERADMIN)**

#### 5.1 Dashboard Global
- **URL**: `/dashboard` (después de login como SUPERADMIN)
- **Archivo**: `tasks/screenshots/admin/dashboard.png`
- **Descripción**: Vista global del sistema

#### 5.2 Gestión de Usuarios Global
- **URL**: `/admin/users`
- **Archivo**: `tasks/screenshots/admin/user-management.png`
- **Descripción**: Control de todos los usuarios

#### 5.3 Gestión de Instituciones
- **URL**: `/admin/institutions`
- **Archivo**: `tasks/screenshots/admin/institution-management.png`
- **Descripción**: Administración de instituciones

#### 5.4 Gestión de Empresas
- **URL**: `/admin/companies`
- **Archivo**: `tasks/screenshots/admin/company-management.png`
- **Descripción**: Supervisión empresarial

---

### 🌟 **FASE 6: Funcionalidades Transversales**

#### 6.1 Sistema de Mensajería
- **URL**: `/messages`
- **Archivo**: `tasks/screenshots/features/messaging.png`
- **Descripción**: Comunicación contextual

#### 6.2 Portal de Noticias
- **URL**: `/news`
- **Archivo**: `tasks/screenshots/features/news.png`
- **Descripción**: Centro de comunicaciones

#### 6.3 Recursos Educativos
- **URL**: `/resources`
- **Archivo**: `tasks/screenshots/features/resources.png`
- **Descripción**: Biblioteca digital

---

## 🛠️ Configuración Técnica

### Herramientas Recomendadas
- **Windows**: Snipping Tool (nativo) o Greenshot (gratuito)
- **Browser**: Chrome o Edge (zoom 100%)
- **Resolución**: 1920x1080 mínimo
- **Formato**: PNG (mejor calidad)

### Preparación del Entorno
```bash
# Iniciar la aplicación
pnpm run dev

# Verificar que todos los servicios estén activos
pnpm run docker:status

# Asegurar datos de prueba
pnpm run db:seed
```

### Buenas Prácticas
1. **Modo Incógnito**: Usar ventana privada para sesión limpia
2. **Datos Consistentes**: Usar mismos datos de prueba en todas las capturas
3. **Estado Limpio**: Limpiar cache del navegador antes de comenzar
4. **Captura Completa**: Incluir toda la interfaz visible (no solo viewport)
5. **Nomenclatura**: Seguir exactamente los nombres de archivo especificados

---

## 📱 Compilación LaTeX

### Con MiKTeX (Recomendado)
```powershell
cd tasks
pdflatex informe_tecnico_emplea_y_emprende_auditor.tex
```

### Paquetes Requeridos
- `float` ✅ (ya incluido)
- `minted` ✅ (ya incluido)
- `tcolorbox` ✅ (ya incluido)
- `graphicx` ✅ (ya incluido)

### Estructura Final Esperada
```
tasks/
├── informe_tecnico_emplea_y_emprende_auditor.tex    # ✅ Actualizado
├── informe_tecnico_emplea_y_emprende_auditor.pdf    # 📄 Resultado final
├── screenshot_guide.md                  # 📋 Esta guía
└── screenshots/                         # 📸 Capturas
    ├── auth/ (3 imágenes)
    ├── youth/ (9 imágenes)
    ├── companies/ (5 imágenes)
    ├── institutions/ (4 imágenes)
    ├── admin/ (4 imágenes)
    └── features/ (3 imágenes)
```

**Total**: 28 capturas de pantalla para un tour visual completo

---

## ✅ Lista de Verificación

### Preparación
- [ ] Aplicación ejecutándose en `localhost:3000`
- [ ] Base de datos con datos de prueba
- [ ] Usuarios de prueba para cada rol
- [ ] Navegador configurado (zoom 100%, modo incógnito)

### Capturas por Sección
- [ ] **Auth** (3/3): landing-page, sign-in, sign-up
- [ ] **Youth** (9/9): dashboard → entrepreneurship
- [ ] **Companies** (5/5): dashboard → profile
- [ ] **Institutions** (4/4): dashboard → student-management
- [ ] **Admin** (4/4): dashboard → company-management
- [ ] **Features** (3/3): messaging, news, resources

### Compilación
- [ ] Archivos PNG en directorios correctos
- [ ] Compilación LaTeX exitosa
- [ ] PDF generado sin errores
- [ ] Verificación visual de todas las imágenes

---

## 🎯 Resultado Final

Un informe técnico completo con **28 capturas de pantalla** que documenta visualmente toda la funcionalidad de la plataforma Emplea y Emprende, organizado por rol de usuario y con evidencia técnica citada para cada funcionalidad mostrada.

Este tour visual servirá como:
- **Documentación técnica** del sistema implementado
- **Manual de usuario** para cada tipo de actor
- **Evidencia visual** de la implementación exitosa
- **Material de presentación** para stakeholders