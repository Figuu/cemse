# CEMSE YOUTH USER - Complete UX/UI Specification

## 📱 Guía Completa de UX/UI para React Native & Expo

**Version:** 1.0
**Fecha:** 29 de Septiembre, 2024
**Entorno:** Producción (https://cemse.boring.lat)
**Usuario de Prueba:** intirraptor1@gmail.com | Password: 123456

---

## 📋 Tabla de Contenidos

1. [Panel Principal (Dashboard)](#1-panel-principal-dashboard)
2. [Empleos (Jobs)](#2-empleos-jobs)
3. [Mis Postulaciones (Applications)](#3-mis-postulaciones-applications)
4. [Instituciones (Institutions)](#4-instituciones-institutions)
5. [Mi Perfil (Profile)](#5-mi-perfil-profile)
6. [Constructor de CV (CV Builder)](#6-constructor-de-cv-cv-builder)
7. [Cursos (Courses)](#7-cursos-courses)
8. [Certificados (Certificates)](#8-certificados-certificates)
9. [Recursos (Resources)](#9-recursos-resources)
10. [Hub de Emprendimiento](#10-hub-de-emprendimiento-entrepreneurship)
11. [Noticias (News)](#11-noticias-news)

---

## 1. Panel Principal (Dashboard)

### 📍 Ruta
```
Web: /dashboard
Mobile: DashboardScreen (Tab Navigator - Home)
```

### 🔌 API Endpoints
```javascript
// Dashboard Stats - MOBILE: Calculated client-side from contexts
// WEB: Optional endpoint available at GET /api/youth/stats
// Mobile implementation uses data from:
// - CoursesContext (enrollments with status === 'COMPLETED')
// - CertificatesContext (moduleCertificates + courseCertificates)
// - YouthApplicationsContext (applications count)
// - CoursesContext (study hours from course durations)

// Actividad Reciente (datos agregados de otras secciones)
// Mobile implementation uses:
GET /api/news                     // News carousel (limit: 3, status: PUBLISHED)
GET /api/resources                // Resources carousel (limit: 3, sortBy: publishDate)
// Courses data from CoursesContext (sorted by createdAt, limit: 3)
```

### 🎨 Componentes UI

#### 1. Welcome Section (Sección de Bienvenida)
**Componente:** `WelcomeHeader`
```javascript
<View style={styles.welcomeSection}>
  <View style={styles.greetingContainer}>
    <Avatar size="large" source={user.avatar} />
    <View style={styles.greetingText}>
      <Text style={styles.greeting}>
        ¡Bienvenido, {user.firstName}!
      </Text>
      <Text style={styles.role}>
        {user.role === 'YOUTH' ? 'Joven' : user.role}
      </Text>
      <Text style={styles.profileCompletion}>
        Perfil: {user.profileCompletion}% completado
      </Text>
    </View>
  </View>
</View>
```

**Datos mostrados:**
- Avatar del usuario (si existe)
- Nombre del usuario: `{profile.firstName} {profile.lastName}`
- Rol del usuario: Traducido a "Joven" para YOUTH
- Progreso del perfil: `profileCompletion` (0-100%)

**Comportamiento móvil:**
- Avatar circular con bordes
- Texto responsivo
- Tap en avatar → Navega a Profile

---

#### 2. Stats Cards (Tarjetas de Estadísticas)
**Componente:** `StatsCards`
**Layout:** Grid 2x2 en móvil

```javascript
const statsData = [
  {
    title: "Cursos Completados",
    value: completedCourses, // Número
    icon: "CheckCircle",
    iconColor: "#10B981",
    endpoint: "GET /api/courses (filtrar isEnrolled + progress 100%)"
  },
  {
    title: "Certificados",
    value: totalCertificates, // Número
    icon: "Award",
    iconColor: "#F59E0B",
    endpoint: "GET /api/certificates (count)"
  },
  {
    title: "Aplicaciones Enviadas",
    value: totalApplications, // Número
    icon: "Briefcase",
    iconColor: "#3B82F6",
    endpoint: "GET /api/applications + GET /api/youth-applications (sum)"
  },
  {
    title: "Horas de Estudio",
    value: totalHours, // Número calculado
    icon: "Clock",
    iconColor: "#8B5CF6",
    endpoint: "Calculado del progreso de cursos"
  }
];
```

**Card UI:**
```javascript
<Card style={styles.statCard}>
  <Icon name={stat.icon} size={24} color={stat.iconColor} />
  <Text style={styles.statValue}>{stat.value}</Text>
  <Text style={styles.statTitle}>{stat.title}</Text>
  {stat.change && (
    <View style={styles.changeIndicator}>
      <Icon name={stat.change.type === 'increase' ? 'arrow-up' : 'arrow-down'} />
      <Text style={stat.change.type === 'increase' ? styles.increase : styles.decrease}>
        {stat.change.value}%
      </Text>
      <Text style={styles.changeLabel}>vs mes anterior</Text>
    </View>
  )}
</Card>
```

**Interacciones:**
- Tap en cada card → Navega a su sección respectiva
  - Cursos Completados → CoursesScreen
  - Certificados → CertificatesScreen
  - Aplicaciones → ApplicationsScreen
  - Horas de Estudio → CoursesScreen

---

#### 3. Quick Actions (Acciones Rápidas)
**⚠️ ESTADO MOBILE:** No implementado en home.tsx - Las acciones están disponibles en la navegación principal (Tab Navigator)
**Componente:** `QuickActionsGrid`
**Layout:** Grid 2x2

```javascript
const quickActions = [
  {
    name: "Explorar Cursos",
    href: "/courses",
    screen: "CoursesScreen",
    icon: "GraduationCap",
    iconColor: "#3B82F6",
    backgroundColor: "#EFF6FF"
  },
  {
    name: "Buscar Empleos",
    href: "/jobs",
    screen: "JobsScreen",
    icon: "Briefcase",
    iconColor: "#10B981",
    backgroundColor: "#ECFDF5"
  },
  {
    name: "Mi Perfil",
    href: "/profile",
    screen: "ProfileScreen",
    icon: "User",
    iconColor: "#8B5CF6",
    backgroundColor: "#F3E8FF"
  },
  {
    name: "Emprendimiento",
    href: "/entrepreneurship",
    screen: "EntrepreneurshipScreen",
    icon: "Lightbulb",
    iconColor: "#F59E0B",
    backgroundColor: "#FEF3C7"
  }
];
```

**Action Button UI:**
```javascript
<TouchableOpacity
  style={[styles.actionButton, { backgroundColor: action.backgroundColor }]}
  onPress={() => navigation.navigate(action.screen)}
>
  <View style={styles.iconContainer}>
    <Icon name={action.icon} size={32} color={action.iconColor} />
  </View>
  <Text style={styles.actionName}>{action.name}</Text>
</TouchableOpacity>
```

**Comportamiento:**
- Animación de scale al presionar
- Feedback táctil (haptic)
- Navegación inmediata

---

#### 4. Recent Activity (Actividad Reciente)
**📱 MOBILE IMPLEMENTATION:** Implementado como 3 carousels horizontales separados:
- News Carousel (HorizontalCarousel + NewsCarouselCard)
- Courses Carousel (HorizontalCarousel + CourseCarouselCard)
- Resources Carousel (HorizontalCarousel + ResourceCarouselCard)

**WEB SPECIFICATION:**
**Componente:** `RecentActivityList`

```javascript
// Estructura de datos de actividad
interface ActivityItem {
  id: string;
  type: "course" | "job" | "achievement" | "entrepreneurship" | "profile";
  title: string;
  description: string;
  timestamp: Date;
  user?: {
    name: string;
    avatar?: string;
  };
  status?: "completed" | "in_progress" | "pending" | "new";
}

// Iconos por tipo
const getActivityIcon = (type) => {
  course: <GraduationCap color="#3B82F6" />,
  job: <Briefcase color="#10B981" />,
  achievement: <Award color="#F59E0B" />,
  entrepreneurship: <Lightbulb color="#8B5CF6" />,
  profile: <User color="#6B7280" />
};

// Badges de estado
const getStatusBadge = (status) => {
  completed: { bg: "#ECFDF5", text: "#10B981", label: "Completado" },
  in_progress: { bg: "#EFF6FF", text: "#3B82F6", label: "En Progreso" },
  pending: { bg: "#FEF3C7", text: "#F59E0B", label: "Pendiente" },
  new: { bg: "#F3E8FF", text: "#8B5CF6", label: "Nuevo" }
};
```

**Activity Item UI:**
```javascript
<View style={styles.activityItem}>
  <View style={styles.iconCircle}>
    {getActivityIcon(activity.type)}
  </View>
  <View style={styles.activityContent}>
    <View style={styles.activityHeader}>
      <Text style={styles.activityTitle}>{activity.title}</Text>
      {activity.status && (
        <Badge
          label={getStatusBadge(activity.status).label}
          backgroundColor={getStatusBadge(activity.status).bg}
          textColor={getStatusBadge(activity.status).text}
        />
      )}
    </View>
    <Text style={styles.activityDescription}>{activity.description}</Text>
    <View style={styles.activityFooter}>
      <Text style={styles.timestamp}>
        {formatDateTime(activity.timestamp)}
      </Text>
      {activity.user && (
        <>
          <Text style={styles.separator}>•</Text>
          <Avatar size="small" source={activity.user.avatar} />
          <Text style={styles.userName}>{activity.user.name}</Text>
        </>
      )}
    </View>
  </View>
</View>
```

**Empty State:**
```javascript
<View style={styles.emptyState}>
  <Icon name="Clock" size={48} color="#9CA3AF" />
  <Text style={styles.emptyTitle}>No hay actividad reciente</Text>
  <Text style={styles.emptyMessage}>
    Comienza a usar la plataforma para ver tu actividad aquí.
  </Text>
</View>
```

**Datos:**
- Actividades más recientes (últimas 5-10)
- Formato de fecha relativo: "Hace 2 horas", "Ayer", etc.
- Avatar del usuario si aplica

---

### 📊 Flujo de Datos Dashboard

```
1. App Load → useSession() → Get User Data
2. Fetch Dashboard Data:
   - GET /api/courses?userId={userId}
   - GET /api/certificates?userId={userId}
   - GET /api/applications?userId={userId}
   - GET /api/youth-applications?userId={userId}
3. Calculate Stats:
   - completedCourses = courses.filter(c => c.progress === 100).length
   - totalCertificates = certificates.length
   - totalApplications = applications.length + youthApplications.length
   - totalHours = sum of course durations for completed courses
4. Build Activity Timeline:
   - Combine recent activities from all modules
   - Sort by timestamp DESC
   - Limit to 10 items
5. Render Dashboard Components
```

---

## 2. Empleos (Jobs)

### 📍 Ruta
```
Web: /jobs
Mobile: JobsScreen (Tab Navigator)
```

### 🔌 API Endpoints

```javascript
// 1. Listar empleos
GET /api/jobs?search={term}&location={location}&type={type}&experience={level}

Response: {
  success: true,
  jobs: [
    {
      id: "string",
      title: "string",
      description: "string",
      requirements: "string",
      benefits: "string",
      location: "string | { city, state, country, isRemote }",
      salaryMin: number,
      salaryMax: number,
      salaryCurrency: "BOB",
      employmentType: "FULL_TIME" | "PART_TIME" | "CONTRACT" | "FREELANCE",
      experienceLevel: "ENTRY_LEVEL" | "INTERMEDIATE" | "ADVANCED" | "EXPERT",
      educationLevel: "SECONDARY" | "TECHNICAL" | "UNIVERSITY" | "POSTGRADUATE",
      isActive: boolean,
      createdAt: "ISO string",
      expiresAt: "ISO string",
      company: {
        id: "string",
        name: "string",
        logo: "string",
        businessSector: "string"
      },
      _count: {
        applications: number
      }
    }
  ],
  pagination: {
    total: number,
    page: number,
    limit: number
  }
}

// 2. Detalle de empleo
GET /api/jobs/{id}

Response: {
  success: true,
  job: { /* Estructura igual a arriba más detalles */ }
}

// 3. Aplicar a empleo
POST /api/applications
Body: {
  jobId: "string",
  coverLetter: "string",
  resumeUrl?: "string"
}

Response: {
  success: true,
  application: {
    id: "string",
    status: "PENDING",
    appliedDate: "ISO string"
  }
}

// 4. Obtener mis aplicaciones
GET /api/applications

Response: {
  success: true,
  applications: [
    {
      id: "string",
      job: { /* Datos del empleo */ },
      status: "PENDING" | "VIEWED" | "ACCEPTED" | "REJECTED",
      coverLetter: "string",
      appliedDate: "ISO string"
    }
  ]
}
```

### 🎨 Componentes UI

#### 1. Search Header
**Componente:** `JobSearchHeader`

```javascript
<View style={styles.searchHeader}>
  <View style={styles.searchBar}>
    <Icon name="Search" size={20} color="#9CA3AF" />
    <TextInput
      placeholder="Buscar empleos por título, empresa..."
      value={searchTerm}
      onChangeText={setSearchTerm}
      style={styles.searchInput}
    />
    {searchTerm && (
      <TouchableOpacity onPress={() => setSearchTerm('')}>
        <Icon name="X" size={20} color="#9CA3AF" />
      </TouchableOpacity>
    )}
  </View>

  <TouchableOpacity
    style={styles.filterButton}
    onPress={() => setShowFilters(true)}
  >
    <Icon name="Filter" size={20} />
    {activeFiltersCount > 0 && (
      <Badge value={activeFiltersCount} style={styles.filterBadge} />
    )}
  </TouchableOpacity>
</View>
```

**Comportamiento:**
- Búsqueda con debounce (300ms)
- Clear button cuando hay texto
- Badge en filtro indica filtros activos

---

#### 2. Filters Modal
**Componente:** `JobFiltersModal`

```javascript
<BottomSheet isVisible={showFilters} onClose={() => setShowFilters(false)}>
  <View style={styles.filtersContent}>
    <Text style={styles.filtersTitle}>Filtrar Empleos</Text>

    {/* Ubicación */}
    <FilterSection>
      <Label>Ubicación</Label>
      <Select
        value={filters.location}
        onChange={(value) => setFilters({...filters, location: value})}
        options={locations}
      />
    </FilterSection>

    {/* Tipo de Empleo */}
    <FilterSection>
      <Label>Tipo de Empleo</Label>
      <ChipGroup
        options={employmentTypes}
        selected={filters.type}
        onSelect={(value) => setFilters({...filters, type: value})}
      />
    </FilterSection>

    {/* Nivel de Experiencia */}
    <FilterSection>
      <Label>Nivel de Experiencia</Label>
      <ChipGroup
        options={experienceLevels}
        selected={filters.experience}
        onSelect={(value) => setFilters({...filters, experience: value})}
      />
    </FilterSection>

    {/* Rango Salarial */}
    <FilterSection>
      <Label>Rango Salarial (BOB)</Label>
      <RangeSlider
        min={0}
        max={20000}
        values={[filters.salaryMin, filters.salaryMax]}
        onValuesChange={(values) => setFilters({
          ...filters,
          salaryMin: values[0],
          salaryMax: values[1]
        })}
      />
      <View style={styles.salaryLabels}>
        <Text>{filters.salaryMin} BOB</Text>
        <Text>{filters.salaryMax} BOB</Text>
      </View>
    </FilterSection>

    {/* Actions */}
    <View style={styles.filterActions}>
      <Button variant="outline" onPress={clearFilters}>
        Limpiar
      </Button>
      <Button onPress={applyFilters}>
        Aplicar Filtros
      </Button>
    </View>
  </View>
</BottomSheet>
```

**Opciones de filtros:**
```javascript
const employmentTypes = [
  { value: "FULL_TIME", label: "Tiempo Completo" },
  { value: "PART_TIME", label: "Medio Tiempo" },
  { value: "CONTRACT", label: "Por Contrato" },
  { value: "FREELANCE", label: "Freelance" }
];

const experienceLevels = [
  { value: "ENTRY_LEVEL", label: "Principiante" },
  { value: "INTERMEDIATE", label: "Intermedio" },
  { value: "ADVANCED", label: "Avanzado" },
  { value: "EXPERT", label: "Experto" }
];

const locations = [
  "Cochabamba", "La Paz", "Santa Cruz", "Remoto", "Híbrido"
];
```

---

#### 3. Job Card
**Componente:** `JobCard`

```javascript
<TouchableOpacity
  style={styles.jobCard}
  onPress={() => navigation.navigate('JobDetail', { jobId: job.id })}
>
  <View style={styles.cardHeader}>
    <Avatar
      size="medium"
      source={job.company.logo}
      fallback={<Icon name="Building" />}
    />
    <View style={styles.jobInfo}>
      <Text style={styles.jobTitle} numberOfLines={2}>
        {job.title}
      </Text>
      <Text style={styles.companyName}>{job.company.name}</Text>
    </View>
    <TouchableOpacity
      style={styles.favoriteButton}
      onPress={() => toggleFavorite(job.id)}
    >
      <Icon
        name={isFavorite(job.id) ? "Heart" : "HeartOutline"}
        color={isFavorite(job.id) ? "#EF4444" : "#9CA3AF"}
      />
    </TouchableOpacity>
  </View>

  <View style={styles.jobDetails}>
    {/* Location */}
    <View style={styles.detailItem}>
      <Icon name="MapPin" size={16} color="#6B7280" />
      <Text style={styles.detailText}>
        {typeof job.location === 'string'
          ? job.location
          : `${job.location.city}, ${job.location.state}`}
      </Text>
    </View>

    {/* Salary */}
    {(job.salaryMin || job.salaryMax) && (
      <View style={styles.detailItem}>
        <Icon name="DollarSign" size={16} color="#6B7280" />
        <Text style={styles.detailText}>
          {formatSalaryRange(job.salaryMin, job.salaryMax, job.salaryCurrency)}
        </Text>
      </View>
    )}

    {/* Employment Type */}
    <View style={styles.detailItem}>
      <Icon name="Clock" size={16} color="#6B7280" />
      <Text style={styles.detailText}>
        {translateEmploymentType(job.employmentType)}
      </Text>
    </View>
  </View>

  <View style={styles.cardBadges}>
    <Badge
      label={translateExperience(job.experienceLevel)}
      variant="secondary"
    />
    <Badge
      label={`${job._count.applications} postulaciones`}
      variant="outline"
    />
    {isRecent(job.createdAt) && (
      <Badge label="Nuevo" variant="success" />
    )}
  </View>

  <View style={styles.cardActions}>
    <Button
      variant="outline"
      size="small"
      onPress={() => navigation.navigate('JobDetail', { jobId: job.id })}
    >
      <Icon name="Eye" size={16} />
      <Text>Ver Detalles</Text>
    </Button>
    <Button
      size="small"
      onPress={() => handleQuickApply(job.id)}
    >
      <Icon name="Send" size={16} />
      <Text>Postular</Text>
    </Button>
  </View>
</TouchableOpacity>
```

**Helpers:**
```javascript
const formatSalaryRange = (min, max, currency) => {
  if (min && max) return `${min} - ${max} ${currency}`;
  if (min) return `Desde ${min} ${currency}`;
  if (max) return `Hasta ${max} ${currency}`;
  return "A convenir";
};

const translateEmploymentType = (type) => ({
  FULL_TIME: "Tiempo Completo",
  PART_TIME: "Medio Tiempo",
  CONTRACT: "Por Contrato",
  FREELANCE: "Freelance"
}[type]);

const translateExperience = (level) => ({
  ENTRY_LEVEL: "Principiante",
  INTERMEDIATE: "Intermedio",
  ADVANCED: "Avanzado",
  EXPERT: "Experto"
}[level]);
```

---

#### 4. Job Detail Screen
**Componente:** `JobDetailScreen`

```javascript
<ScrollView style={styles.jobDetail}>
  {/* Header */}
  <View style={styles.detailHeader}>
    <Avatar size="large" source={job.company.logo} />
    <View style={styles.headerText}>
      <Text style={styles.jobTitle}>{job.title}</Text>
      <Text style={styles.companyName}>{job.company.name}</Text>
      <Text style={styles.businessSector}>{job.company.businessSector}</Text>
    </View>
  </View>

  {/* Quick Info */}
  <Card style={styles.quickInfo}>
    <InfoRow icon="MapPin" label="Ubicación" value={job.location} />
    <InfoRow icon="Briefcase" label="Tipo" value={translateEmploymentType(job.employmentType)} />
    <InfoRow icon="TrendingUp" label="Experiencia" value={translateExperience(job.experienceLevel)} />
    <InfoRow icon="GraduationCap" label="Educación" value={job.educationLevel} />
    <InfoRow icon="DollarSign" label="Salario" value={formatSalaryRange(job.salaryMin, job.salaryMax, job.salaryCurrency)} />
    <InfoRow icon="Clock" label="Publicado" value={formatRelativeTime(job.createdAt)} />
    {job.expiresAt && (
      <InfoRow icon="Calendar" label="Expira" value={formatDate(job.expiresAt)} />
    )}
  </Card>

  {/* Tabs */}
  <Tabs>
    <Tab label="Descripción">
      <View style={styles.section}>
        <SectionTitle icon="FileText">Descripción del Puesto</SectionTitle>
        <Text style={styles.description}>{job.description}</Text>
      </View>
    </Tab>

    <Tab label="Requisitos">
      <View style={styles.section}>
        <SectionTitle icon="CheckSquare">Requisitos</SectionTitle>
        <BulletList items={parseRequirements(job.requirements)} />
      </View>
    </Tab>

    <Tab label="Beneficios">
      <View style={styles.section}>
        <SectionTitle icon="Gift">Beneficios</SectionTitle>
        <BulletList items={parseBenefits(job.benefits)} />
      </View>
    </Tab>

    <Tab label="Empresa">
      <CompanyInfo company={job.company} />
    </Tab>
  </Tabs>

  {/* CTA */}
  <View style={styles.ctaContainer}>
    {hasApplied ? (
      <View style={styles.appliedStatus}>
        <Icon name="CheckCircle" size={24} color="#10B981" />
        <Text style={styles.appliedText}>Ya postulaste a este empleo</Text>
        <Text style={styles.appliedDate}>
          Postulaste el {formatDate(application.appliedDate)}
        </Text>
      </View>
    ) : (
      <>
        <Button
          variant="outline"
          onPress={shareJob}
        >
          <Icon name="Share" />
          Compartir
        </Button>
        <Button
          style={styles.applyButton}
          onPress={() => setShowApplicationModal(true)}
        >
          <Icon name="Send" />
          Postular Ahora
        </Button>
      </>
    )}
  </View>
</ScrollView>

{/* Application Modal */}
{showApplicationModal && (
  <ApplicationModal
    job={job}
    onSubmit={handleSubmitApplication}
    onClose={() => setShowApplicationModal(false)}
  />
)}
```

---

### 📊 Flujo de Aplicación

```
1. User opens Job Detail
2. User taps "Postular Ahora"
3. ApplicationModal opens with:
   - Job summary
   - Cover letter input (text area)
   - CV selector (pick from saved CVs or upload new)
   - Terms checkbox
4. User fills form
5. User taps "Enviar Postulación"
6. POST /api/applications with:
   {
     jobId: job.id,
     coverLetter: coverLetterText,
     resumeUrl: selectedCV.url
   }
7. On success:
   - Show success message
   - Update UI (hasApplied = true)
   - Navigate back or stay on detail
8. On error:
   - Show error message
   - Keep modal open for retry
```

---

## 3. Mis Postulaciones (Applications)

### 📍 Ruta
```
Web: /youth-applications
Mobile: ApplicationsScreen (Tab Navigator)
```

### 🔌 API Endpoints

```javascript
// 1. Obtener aplicaciones de perfil abierto (Youth Applications)
GET /api/youth-applications

Response: {
  success: true,
  applications: [
    {
      id: "string",
      title: "string",
      description: "string",
      skills: string[],
      interests: string[],
      expectedSalary: number,
      isPublic: boolean,
      status: "ACTIVE" | "PAUSED" | "CLOSED" | "HIRED",
      viewsCount: number,
      interestsCount: number,
      createdAt: "ISO string",
      updatedAt: "ISO string",
      youth: {
        id: "string",
        profile: {
          firstName: "string",
          lastName: "string",
          city: "string",
          experienceLevel: "string",
          educationLevel: "string"
        }
      }
    }
  ]
}

// 2. Crear aplicación de perfil abierto
POST /api/youth-applications
Body: {
  title: "string",
  description: "string",
  skills: string[],
  interests: string[],
  expectedSalary: number,
  isPublic: boolean
}

// 3. Aplicaciones a empleos específicos
GET /api/applications

Response: {
  success: true,
  applications: [
    {
      id: "string",
      job: {
        id: "string",
        title: "string",
        company: {
          name: "string",
          logo: "string"
        }
      },
      coverLetter: "string",
      status: "PENDING" | "VIEWED" | "ACCEPTED" | "REJECTED",
      appliedDate: "ISO string",
      viewedDate?: "ISO string",
      respondedDate?: "ISO string"
    }
  ]
}
```

### 🎨 Componentes UI

#### 1. Applications Header with Tabs
**Componente:** `ApplicationsHeader`

```javascript
<View style={styles.applicationsHeader}>
  <Text style={styles.title}>Mis Postulaciones</Text>
  <Text style={styles.subtitle}>
    Gestiona tus aplicaciones y perfil abierto
  </Text>

  <Tabs>
    <Tab
      label={`Empleos (${jobApplications.length})`}
      active={activeTab === 'jobs'}
      onPress={() => setActiveTab('jobs')}
    />
    <Tab
      label={`Perfil Abierto (${youthApplications.length})`}
      active={activeTab === 'youth'}
      onPress={() => setActiveTab('youth')}
    />
  </Tabs>
</View>
```

---

#### 2. Stats Cards
**Componente:** `ApplicationStats`

```javascript
<View style={styles.statsGrid}>
  <StatCard
    icon="FileText"
    iconColor="#3B82F6"
    value={totalApplications}
    label="Total Postulaciones"
  />
  <StatCard
    icon="Eye"
    iconColor="#10B981"
    value={viewedApplications}
    label="Vistas"
  />
  <StatCard
    icon="CheckCircle"
    iconColor="#F59E0B"
    value={acceptedApplications}
    label="Aceptadas"
  />
  <StatCard
    icon="Clock"
    iconColor="#8B5CF6"
    value={pendingApplications}
    label="Pendientes"
  />
</View>
```

---

#### 3. Job Application Card
**Componente:** `JobApplicationCard`

```javascript
<Card style={styles.applicationCard}>
  <View style={styles.cardHeader}>
    <Avatar source={application.job.company.logo} size="medium" />
    <View style={styles.jobInfo}>
      <Text style={styles.jobTitle}>{application.job.title}</Text>
      <Text style={styles.companyName}>{application.job.company.name}</Text>
    </View>
    <StatusBadge status={application.status} />
  </View>

  <View style={styles.applicationDetails}>
    <DetailRow
      icon="Calendar"
      label="Postulado"
      value={formatRelativeTime(application.appliedDate)}
    />
    {application.viewedDate && (
      <DetailRow
        icon="Eye"
        label="Visto"
        value={formatRelativeTime(application.viewedDate)}
      />
    )}
    {application.respondedDate && (
      <DetailRow
        icon="MessageCircle"
        label="Respuesta"
        value={formatRelativeTime(application.respondedDate)}
      />
    )}
  </View>

  {application.coverLetter && (
    <TouchableOpacity
      style={styles.coverLetterPreview}
      onPress={() => showCoverLetter(application.coverLetter)}
    >
      <Icon name="FileText" size={16} />
      <Text style={styles.coverLetterLabel}>Ver carta de presentación</Text>
      <Icon name="ChevronRight" size={16} />
    </TouchableOpacity>
  )}

  <View style={styles.cardActions}>
    <Button
      variant="outline"
      size="small"
      onPress={() => navigation.navigate('JobDetail', { jobId: application.job.id })}
    >
      Ver Empleo
    </Button>
    {application.status === 'PENDING' && (
      <Button
        variant="destructive"
        size="small"
        onPress={() => cancelApplication(application.id)}
      >
        Cancelar
      </Button>
    )}
  </View>
</Card>
```

**Status Badges:**
```javascript
const statusConfig = {
  PENDING: {
    label: "Pendiente",
    color: "#F59E0B",
    backgroundColor: "#FEF3C7",
    icon: "Clock"
  },
  VIEWED: {
    label: "Visto",
    color: "#3B82F6",
    backgroundColor: "#DBEAFE",
    icon: "Eye"
  },
  ACCEPTED: {
    label: "Aceptado",
    color: "#10B981",
    backgroundColor: "#D1FAE5",
    icon: "CheckCircle"
  },
  REJECTED: {
    label: "Rechazado",
    color: "#EF4444",
    backgroundColor: "#FEE2E2",
    icon: "XCircle"
  }
};

const StatusBadge = ({ status }) => {
  const config = statusConfig[status];
  return (
    <View style={[styles.statusBadge, { backgroundColor: config.backgroundColor }]}>
      <Icon name={config.icon} size={14} color={config.color} />
      <Text style={[styles.statusText, { color: config.color }]}>
        {config.label}
      </Text>
    </View>
  );
};
```

---

#### 4. Youth Application Card (Perfil Abierto)
**Componente:** `YouthApplicationCard`

```javascript
<Card style={styles.youthApplicationCard}>
  <View style={styles.cardHeader}>
    <View style={styles.titleSection}>
      <Text style={styles.applicationTitle}>{application.title}</Text>
      <StatusBadge status={application.status} />
    </View>
    <TouchableOpacity
      style={styles.menuButton}
      onPress={() => openMenu(application.id)}
    >
      <Icon name="MoreVertical" size={20} />
    </TouchableOpacity>
  </View>

  <Text style={styles.description} numberOfLines={3}>
    {application.description}
  </Text>

  {application.skills.length > 0 && (
    <View style={styles.skillsContainer}>
      {application.skills.slice(0, 5).map(skill => (
        <Chip key={skill} label={skill} size="small" />
      ))}
      {application.skills.length > 5 && (
        <Chip
          label={`+${application.skills.length - 5}`}
          size="small"
          variant="outlined"
        />
      )}
    </View>
  )}

  <View style={styles.statsRow}>
    <View style={styles.statItem}>
      <Icon name="Eye" size={16} color="#6B7280" />
      <Text style={styles.statValue}>{application.viewsCount}</Text>
      <Text style={styles.statLabel}>Vistas</Text>
    </View>
    <View style={styles.statDivider} />
    <View style={styles.statItem}>
      <Icon name="Heart" size={16} color="#6B7280" />
      <Text style={styles.statValue}>{application.interestsCount}</Text>
      <Text style={styles.statLabel}>Interesados</Text>
    </View>
    <View style={styles.statDivider} />
    <View style={styles.statItem}>
      <Icon name={application.isPublic ? "Globe" : "Lock"} size={16} color="#6B7280" />
      <Text style={styles.statLabel}>
        {application.isPublic ? "Público" : "Privado"}
      </Text>
    </View>
  </View>

  <View style={styles.cardActions}>
    <Button
      variant="outline"
      size="small"
      onPress={() => editApplication(application)}
    >
      <Icon name="Edit" size={16} />
      Editar
    </Button>
    <Button
      variant="outline"
      size="small"
      onPress={() => shareApplication(application)}
    >
      <Icon name="Share" size={16} />
      Compartir
    </Button>
    {application.status === 'ACTIVE' ? (
      <Button
        size="small"
        onPress={() => pauseApplication(application.id)}
      >
        <Icon name="Pause" size={16} />
        Pausar
      </Button>
    ) : (
      <Button
        size="small"
        onPress={() => activateApplication(application.id)}
      >
        <Icon name="Play" size={16} />
        Activar
      </Button>
    )}
  </View>
</Card>
```

**Youth Application Status:**
```javascript
const youthStatusConfig = {
  ACTIVE: {
    label: "Activo",
    color: "#10B981",
    backgroundColor: "#D1FAE5",
    icon: "CheckCircle"
  },
  PAUSED: {
    label: "Pausado",
    color: "#F59E0B",
    backgroundColor: "#FEF3C7",
    icon: "Pause"
  },
  CLOSED: {
    label: "Cerrado",
    color: "#6B7280",
    backgroundColor: "#F3F4F6",
    icon: "XCircle"
  },
  HIRED: {
    label: "Contratado",
    color: "#8B5CF6",
    backgroundColor: "#EDE9FE",
    icon: "Briefcase"
  }
};
```

---

#### 5. Create Youth Application Modal
**Componente:** `CreateYouthApplicationModal`

```javascript
<Modal isVisible={showCreateModal} onClose={() => setShowCreateModal(false)}>
  <View style={styles.modalContent}>
    <Text style={styles.modalTitle}>Crear Perfil Abierto</Text>
    <Text style={styles.modalSubtitle}>
      Permite que las empresas te encuentren y contacten
    </Text>

    <ScrollView>
      <FormField>
        <Label>Título del Perfil *</Label>
        <Input
          placeholder="Ej: Desarrollador Frontend Junior"
          value={formData.title}
          onChangeText={(text) => setFormData({...formData, title: text})}
        />
      </FormField>

      <FormField>
        <Label>Descripción *</Label>
        <TextArea
          placeholder="Describe tu perfil, experiencia y lo que buscas..."
          value={formData.description}
          onChangeText={(text) => setFormData({...formData, description: text})}
          rows={5}
        />
        <HelperText>{formData.description.length}/500</HelperText>
      </FormField>

      <FormField>
        <Label>Habilidades</Label>
        <TagInput
          tags={formData.skills}
          onChange={(skills) => setFormData({...formData, skills})}
          placeholder="Agrega tus habilidades..."
        />
      </FormField>

      <FormField>
        <Label>Áreas de Interés</Label>
        <TagInput
          tags={formData.interests}
          onChange={(interests) => setFormData({...formData, interests})}
          placeholder="Agrega áreas de interés..."
        />
      </FormField>

      <FormField>
        <Label>Salario Esperado (BOB)</Label>
        <Input
          keyboardType="numeric"
          value={formData.expectedSalary}
          onChangeText={(text) => setFormData({...formData, expectedSalary: text})}
          placeholder="Ej: 5000"
        />
      </FormField>

      <FormField>
        <Checkbox
          label="Hacer público mi perfil"
          checked={formData.isPublic}
          onChange={(checked) => setFormData({...formData, isPublic: checked})}
        />
        <HelperText>
          Si es público, las empresas podrán encontrarte en búsquedas
        </HelperText>
      </FormField>
    </ScrollView>

    <View style={styles.modalActions}>
      <Button
        variant="outline"
        onPress={() => setShowCreateModal(false)}
      >
        Cancelar
      </Button>
      <Button
        onPress={handleSubmitYouthApplication}
        disabled={!formData.title || !formData.description}
      >
        Publicar Perfil
      </Button>
    </View>
  </View>
</Modal>
```

---

### 📊 Flujo de Datos Applications

```
1. Screen Mount
2. Fetch Both Types of Applications:
   - GET /api/applications (job applications)
   - GET /api/youth-applications (open profile applications)
3. Calculate Statistics:
   - Total = jobApps.length + youthApps.length
   - Viewed = jobApps.filter(a => a.viewedDate).length
   - Accepted = jobApps.filter(a => a.status === 'ACCEPTED').length
   - Pending = jobApps.filter(a => a.status === 'PENDING').length
4. Sort and Group:
   - Job apps by date (DESC)
   - Youth apps by status (ACTIVE first, then by date)
5. Handle Actions:
   - Create youth app: POST /api/youth-applications
   - Edit youth app: PUT /api/youth-applications/{id}
   - Pause/Activate: PATCH /api/youth-applications/{id}/status
   - Cancel job app: DELETE /api/applications/{id}
```

---

---

## 4. Instituciones (Institutions)

### 📍 Ruta
```
Web: /institutions
Mobile: InstitutionsScreen
```

### 🔌 API Endpoints

```javascript
// 1. Listar instituciones (ACTUALIZADO - Endpoint corregido)
GET /api/institutions

Response: {
  "success": true,
  "institutions": [
    {
      "id": "string",
      "name": "string",
      "department": "string",
      "region": "string",
      "population": number,
      "mayorName": "string",
      "mayorEmail": "string",
      "mayorPhone": "string",
      "isActive": boolean,
      "email": "string",
      "phone": "string",
      "institutionType": "MUNICIPALITY" | "NGO" | "TRAINING_CENTER" | "FOUNDATION",
      "customType": string | null,
      "primaryColor": string | null,
      "secondaryColor": string | null,
      "createdAt": "ISO string",
      "updatedAt": "ISO string",
      "creator": {
        "id": "string",
        "email": "string",
        "role": "INSTITUTION",
        "profile": {
          "firstName": "string",
          "lastName": "string",
          "profileCompletion": number
        }
      },
      "_count": {
        "companies": number,
        "profiles": number
      }
    }
  ]
}

// 2. Listar empresas asociadas
GET /api/companies

Response: {
  "success": true,
  "companies": [
    {
      "id": "string",
      "name": "string",
      "businessSector": "string",
      "institutionId": "string",
      "logo": "string",
      "description": "string",
      "website": "string",
      "isActive": boolean
    }
  ]
}

// 3. Detalle de institución (si existe endpoint específico)
GET /api/institutions/{id}

// 4. Programas/Cursos de institución
GET /api/institutions/{id}/courses
GET /api/institutions/{id}/programs
```

### 🎨 Componentes UI

#### 1. Institution Search & Filter Header
**Componente:** `InstitutionSearchHeader`

```javascript
<View style={styles.searchSection}>
  <View style={styles.searchBar}>
    <Icon name="Search" size={20} color="#9CA3AF" />
    <TextInput
      placeholder="Buscar instituciones..."
      value={searchTerm}
      onChangeText={setSearchTerm}
      style={styles.searchInput}
    />
    {searchTerm && (
      <TouchableOpacity onPress={() => setSearchTerm('')}>
        <Icon name="X" size={20} />
      </TouchableOpacity>
    )}
  </View>

  <TouchableOpacity
    style={styles.filterButton}
    onPress={() => setShowFilters(true)}
  >
    <Icon name="Filter" size={20} />
    <Text>Filtros</Text>
  </TouchableOpacity>
</View>
```

---

#### 2. Institution Type Tabs
**Componente:** `InstitutionTypeTabs`

```javascript
const institutionTypes = [
  { id: 'all', label: 'Todas', icon: 'Grid' },
  { id: 'MUNICIPALITY', label: 'Municipios', icon: 'Building2' },
  { id: 'NGO', label: 'ONGs', icon: 'Users' },
  { id: 'TRAINING_CENTER', label: 'Centros de Capacitación', icon: 'GraduationCap' },
  { id: 'FOUNDATION', label: 'Fundaciones', icon: 'Heart' }
];

<ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.typeTabs}>
  {institutionTypes.map(type => (
    <TouchableOpacity
      key={type.id}
      style={[
        styles.typeTab,
        selectedType === type.id && styles.typeTabActive
      ]}
      onPress={() => setSelectedType(type.id)}
    >
      <Icon
        name={type.icon}
        size={20}
        color={selectedType === type.id ? '#3B82F6' : '#6B7280'}
      />
      <Text style={[
        styles.typeTabText,
        selectedType === type.id && styles.typeTabTextActive
      ]}>
        {type.label}
      </Text>
      <Badge value={getCountByType(type.id)} />
    </TouchableOpacity>
  ))}
</ScrollView>
```

---

#### 3. Institution Card
**Componente:** `InstitutionCard`

```javascript
<TouchableOpacity
  style={styles.institutionCard}
  onPress={() => navigation.navigate('InstitutionDetail', { id: institution.id })}
>
  <View style={styles.cardHeader}>
    <View style={[styles.iconContainer, { backgroundColor: getTypeColor(institution.institutionType).light }]}>
      <Icon
        name={getTypeIcon(institution.institutionType)}
        size={32}
        color={getTypeColor(institution.institutionType).dark}
      />
    </View>
    <View style={styles.statusBadge}>
      <View style={[styles.statusDot, { backgroundColor: institution.isActive ? '#10B981' : '#9CA3AF' }]} />
      <Text style={styles.statusText}>
        {institution.isActive ? 'Activo' : 'Inactivo'}
      </Text>
    </View>
  </View>

  <View style={styles.cardContent}>
    <Text style={styles.institutionName} numberOfLines={2}>
      {institution.name}
    </Text>

    <View style={styles.typeContainer}>
      <Badge
        label={translateInstitutionType(institution.institutionType)}
        variant="secondary"
      />
    </View>

    <View style={styles.detailsGrid}>
      {/* Location */}
      <DetailRow icon="MapPin" label="Ubicación">
        <Text style={styles.detailValue}>
          {institution.department}, {institution.region}
        </Text>
      </DetailRow>

      {/* Population (for municipalities) */}
      {institution.institutionType === 'MUNICIPALITY' && institution.population && (
        <DetailRow icon="Users" label="Población">
          <Text style={styles.detailValue}>
            {institution.population.toLocaleString()} habitantes
          </Text>
        </DetailRow>
      )}

      {/* Contact */}
      {institution.email && (
        <DetailRow icon="Mail" label="Contacto">
          <Text style={styles.detailValue}>{institution.email}</Text>
        </DetailRow>
      )}

      {institution.phone && (
        <DetailRow icon="Phone" label="Teléfono">
          <Text style={styles.detailValue}>{institution.phone}</Text>
        </DetailRow>
      )}

      {/* Mayor (for municipalities) */}
      {institution.institutionType === 'MUNICIPALITY' && institution.mayorName && (
        <DetailRow icon="User" label="Alcalde">
          <Text style={styles.detailValue}>{institution.mayorName}</Text>
        </DetailRow>
      )}
    </View>

    {/* Stats Footer */}
    <View style={styles.statsFooter}>
      <View style={styles.statItem}>
        <Icon name="Building" size={16} color="#6B7280" />
        <Text style={styles.statText}>
          {institution._count.companies} empresas
        </Text>
      </View>
      <View style={styles.statDivider} />
      <View style={styles.statItem}>
        <Icon name="Users" size={16} color="#6B7280" />
        <Text style={styles.statText}>
          {institution._count.profiles} perfiles
        </Text>
      </View>
    </View>
  </View>

  <View style={styles.cardActions}>
    <Button
      variant="outline"
      size="small"
      onPress={() => navigation.navigate('InstitutionDetail', { id: institution.id })}
    >
      <Icon name="Eye" size={16} />
      <Text>Ver Detalles</Text>
    </Button>
    <Button
      size="small"
      onPress={() => handleContact(institution)}
    >
      <Icon name="MessageCircle" size={16} />
      <Text>Contactar</Text>
    </Button>
  </View>
</TouchableOpacity>
```

**Helpers:**
```javascript
const getTypeIcon = (type) => {
  const icons = {
    MUNICIPALITY: 'Building2',
    NGO: 'Users',
    TRAINING_CENTER: 'GraduationCap',
    FOUNDATION: 'Heart'
  };
  return icons[type] || 'Building';
};

const getTypeColor = (type) => {
  const colors = {
    MUNICIPALITY: { light: '#DBEAFE', dark: '#3B82F6' },
    NGO: { light: '#D1FAE5', dark: '#10B981' },
    TRAINING_CENTER: { light: '#FEF3C7', dark: '#F59E0B' },
    FOUNDATION: { light: '#FCE7F3', dark: '#EC4899' }
  };
  return colors[type] || { light: '#F3F4F6', dark: '#6B7280' };
};

const translateInstitutionType = (type) => {
  const translations = {
    MUNICIPALITY: 'Municipio',
    NGO: 'ONG',
    TRAINING_CENTER: 'Centro de Capacitación',
    FOUNDATION: 'Fundación'
  };
  return translations[type] || type;
};
```

---

#### 4. Institution Detail Screen
**Componente:** `InstitutionDetailScreen`

```javascript
<ScrollView style={styles.detailScreen}>
  {/* Header */}
  <View style={styles.detailHeader}>
    <View style={[styles.headerIcon, { backgroundColor: getTypeColor(institution.institutionType).light }]}>
      <Icon
        name={getTypeIcon(institution.institutionType)}
        size={48}
        color={getTypeColor(institution.institutionType).dark}
      />
    </View>
    <Text style={styles.institutionName}>{institution.name}</Text>
    <Badge label={translateInstitutionType(institution.institutionType)} />
  </View>

  {/* Quick Info Card */}
  <Card style={styles.quickInfoCard}>
    <InfoRow icon="MapPin" label="Departamento" value={institution.department} />
    <InfoRow icon="MapPin" label="Región" value={institution.region} />
    {institution.population && (
      <InfoRow icon="Users" label="Población" value={`${institution.population.toLocaleString()} habitantes`} />
    )}
    <InfoRow icon="Mail" label="Email" value={institution.email} touchable onPress={() => openEmail(institution.email)} />
    <InfoRow icon="Phone" label="Teléfono" value={institution.phone} touchable onPress={() => callPhone(institution.phone)} />
    {institution.mayorName && (
      <>
        <InfoRow icon="User" label="Alcalde" value={institution.mayorName} />
        <InfoRow icon="Mail" label="Email Alcalde" value={institution.mayorEmail} touchable />
        <InfoRow icon="Phone" label="Teléfono Alcalde" value={institution.mayorPhone} touchable />
      </>
    )}
  </Card>

  {/* Tabs */}
  <Tabs>
    <Tab label={`Empresas (${companies.length})`}>
      <CompaniesGrid companies={companies} />
    </Tab>

    <Tab label={`Programas (${programs.length})`}>
      <ProgramsList programs={programs} />
    </Tab>

    <Tab label="Información">
      <View style={styles.infoSection}>
        <SectionTitle>Sobre la Institución</SectionTitle>
        <Text style={styles.description}>{institution.description || 'No hay descripción disponible.'}</Text>

        <SectionTitle>Datos de Contacto</SectionTitle>
        <ContactInfo institution={institution} />

        <SectionTitle>Estadísticas</SectionTitle>
        <StatsGrid>
          <StatCard label="Empresas Asociadas" value={institution._count.companies} />
          <StatCard label="Perfiles Registrados" value={institution._count.profiles} />
          <StatCard label="Fecha de Registro" value={formatDate(institution.createdAt)} />
        </StatsGrid>
      </View>
    </Tab>
  </Tabs>

  {/* Action Buttons */}
  <View style={styles.actionButtons}>
    <Button
      variant="outline"
      onPress={() => shareInstitution(institution)}
    >
      <Icon name="Share" />
      Compartir
    </Button>
    <Button
      onPress={() => contactInstitution(institution)}
    >
      <Icon name="MessageCircle" />
      Contactar
    </Button>
  </View>
</ScrollView>
```

---

#### 5. Companies Grid (Empresas de la Institución)
**Componente:** `CompaniesGrid`

```javascript
<View style={styles.companiesGrid}>
  {companies.length === 0 ? (
    <EmptyState
      icon="Building"
      title="No hay empresas"
      message="Esta institución no tiene empresas asociadas aún."
    />
  ) : (
    <FlatList
      data={companies}
      numColumns={2}
      renderItem={({ item: company }) => (
        <CompanyCard
          company={company}
          onPress={() => navigation.navigate('CompanyDetail', { id: company.id })}
        />
      )}
      keyExtractor={company => company.id}
    />
  )}
</View>

// Company Card Component
const CompanyCard = ({ company, onPress }) => (
  <TouchableOpacity style={styles.companyCard} onPress={onPress}>
    <Avatar
      size="large"
      source={company.logo}
      fallback={<Icon name="Building" size={32} />}
    />
    <Text style={styles.companyName} numberOfLines={2}>
      {company.name}
    </Text>
    <Text style={styles.companySector} numberOfLines={1}>
      {company.businessSector}
    </Text>
    <Badge
      label={company.isActive ? 'Activo' : 'Inactivo'}
      variant={company.isActive ? 'success' : 'secondary'}
      size="small"
    />
  </TouchableOpacity>
);
```

---

### 📊 Flujo de Datos Institutions

```
1. Screen Mount
2. Fetch Institutions:
   - GET /api/institutions
3. Fetch Companies:
   - GET /api/companies
4. Process Data:
   - Filter institutions by type if selected
   - Search filter by name, department, region
   - Sort by name (alphabetically)
5. Handle Interactions:
   - Tap institution → Navigate to detail
   - Tap contact → Open email/phone/whatsapp
   - Tap company → Navigate to company detail
6. Contact Actions:
   - Email: mailto:{email}
   - Phone: tel:{phone}
   - WhatsApp: whatsapp://send?phone={phone}
```

---

## 5. Mi Perfil (Profile)

### 📍 Ruta
```
Web: /profile
Mobile: ProfileScreen (Tab Navigator)
```

### 🔌 API Endpoints

```javascript
// 1. Obtener perfil actual
GET /api/profile/me

Response: {
  success: true,
  profile: {
    // Información Básica
    firstName: "string",
    lastName: "string",
    email: "string",
    phone: "string",
    birthDate: "ISO string",
    gender: "male" | "female" | "other",

    // Ubicación
    address: "string",
    city: "string",
    state: "string",
    country: "string",

    // Documentación
    documentType: "CI" | "PASSPORT",
    documentNumber: "string",

    // Profesional
    jobTitle: "string",
    professionalSummary: "string",
    experienceLevel: "ENTRY_LEVEL" | "INTERMEDIATE" | "ADVANCED" | "EXPERT",
    targetPosition: "string",

    // Educación
    educationLevel: "PRIMARY" | "SECONDARY" | "TECHNICAL" | "UNIVERSITY" | "POSTGRADUATE",
    currentInstitution: "string",
    isStudying: boolean,
    currentDegree: "string",
    universityName: "string",
    universityStatus: "STUDYING" | "GRADUATED" | "DROPPED_OUT",
    gpa: "string",

    // Habilidades e Intereses
    skills: string[],
    languages: string[],
    interests: string[],

    // Enlaces Sociales
    socialLinks: {
      linkedin: "string",
      github: "string",
      portfolio: "string"
    },

    // Archivos
    avatarUrl: "string",
    cvUrl: "string",

    // Metadata
    profileCompletion: number, // 0-100
    createdAt: "ISO string",
    updatedAt: "ISO string"
  }
}

// 2. Actualizar perfil completo
PUT /api/profiles
Body: { /* Todos los campos del perfil */ }

// 3. Actualizar campos específicos
PATCH /api/profiles
Body: { /* Campos a actualizar */ }

// 4. Buscar perfiles públicos
GET /api/profiles?search={term}&limit={number}

Response: {
  success: true,
  profiles: [ /* Array de perfiles públicos */ ]
}
```

### 🎨 Componentes UI

#### 1. Profile Header
**Componente:** `ProfileHeader`

```javascript
<View style={styles.profileHeader}>
  <ImageBackground
    source={profileCoverImage || defaultCover}
    style={styles.coverImage}
  >
    <LinearGradient
      colors={['transparent', 'rgba(0,0,0,0.6)']}
      style={styles.gradient}
    />
    <TouchableOpacity
      style={styles.editCoverButton}
      onPress={handleEditCover}
    >
      <Icon name="Camera" size={16} color="#fff" />
    </TouchableOpacity>
  </ImageBackground>

  <View style={styles.profileInfo}>
    <View style={styles.avatarContainer}>
      <Avatar
        size="xlarge"
        source={profile.avatarUrl}
        fallback={getInitials(profile.firstName, profile.lastName)}
      />
      <TouchableOpacity
        style={styles.editAvatarButton}
        onPress={handleEditAvatar}
      >
        <Icon name="Camera" size={16} color="#fff" />
      </TouchableOpacity>
    </View>

    <View style={styles.profileDetails}>
      <Text style={styles.profileName}>
        {profile.firstName} {profile.lastName}
      </Text>
      {profile.jobTitle && (
        <Text style={styles.profileTitle}>{profile.jobTitle}</Text>
      )}
      <View style={styles.profileMeta}>
        <View style={styles.metaItem}>
          <Icon name="MapPin" size={14} color="#6B7280" />
          <Text style={styles.metaText}>
            {profile.city}, {profile.state}
          </Text>
        </View>
        {profile.email && (
          <View style={styles.metaItem}>
            <Icon name="Mail" size={14} color="#6B7280" />
            <Text style={styles.metaText}>{profile.email}</Text>
          </View>
        )}
      </View>
    </View>

    {/* Profile Completion Progress */}
    <View style={styles.completionCard}>
      <View style={styles.completionHeader}>
        <Text style={styles.completionTitle}>Completitud del Perfil</Text>
        <Text style={styles.completionPercentage}>
          {profile.profileCompletion}%
        </Text>
      </View>
      <ProgressBar
        progress={profile.profileCompletion / 100}
        color={getCompletionColor(profile.profileCompletion)}
        style={styles.progressBar}
      />
      {profile.profileCompletion < 100 && (
        <TouchableOpacity
          style={styles.completeProfileButton}
          onPress={() => scrollToIncompleteSection()}
        >
          <Icon name="AlertCircle" size={16} />
          <Text style={styles.completeProfileText}>
            Completa tu perfil para mejores oportunidades
          </Text>
        </TouchableOpacity>
      )}
    </View>
  </View>
</View>
```

**Helpers:**
```javascript
const getInitials = (firstName, lastName) => {
  return `${firstName?.[0] || ''}${lastName?.[0] || ''}`.toUpperCase();
};

const getCompletionColor = (percentage) => {
  if (percentage >= 80) return '#10B981'; // Green
  if (percentage >= 50) return '#F59E0B'; // Orange
  return '#EF4444'; // Red
};
```

---

#### 2. Profile Tabs
**Componente:** `ProfileTabs`

```javascript
<Tabs>
  <Tab label="Información" icon="User">
    <PersonalInformationTab profile={profile} onUpdate={handleUpdate} />
  </Tab>

  <Tab label="Experiencia" icon="Briefcase">
    <ExperienceTab profile={profile} onUpdate={handleUpdate} />
  </Tab>

  <Tab label="Educación" icon="GraduationCap">
    <EducationTab profile={profile} onUpdate={handleUpdate} />
  </Tab>

  <Tab label="Habilidades" icon="Star">
    <SkillsTab profile={profile} onUpdate={handleUpdate} />
  </Tab>

  <Tab label="Configuración" icon="Settings">
    <SettingsTab profile={profile} onUpdate={handleUpdate} />
  </Tab>
</Tabs>
```

---

#### 3. Personal Information Tab
**Componente:** `PersonalInformationTab`

```javascript
<ScrollView style={styles.tabContent}>
  <Card style={styles.section}>
    <SectionHeader
      title="Información Básica"
      icon="User"
      onEdit={() => setEditingSection('basic')}
      isEditing={editingSection === 'basic'}
    />

    {editingSection === 'basic' ? (
      <EditForm onSave={handleSaveBasicInfo} onCancel={() => setEditingSection(null)}>
        <FormField>
          <Label required>Nombre</Label>
          <Input
            value={formData.firstName}
            onChangeText={text => setFormData({...formData, firstName: text})}
            placeholder="Tu nombre"
          />
        </FormField>

        <FormField>
          <Label required>Apellido</Label>
          <Input
            value={formData.lastName}
            onChangeText={text => setFormData({...formData, lastName: text})}
            placeholder="Tu apellido"
          />
        </FormField>

        <FormField>
          <Label>Teléfono</Label>
          <Input
            value={formData.phone}
            onChangeText={text => setFormData({...formData, phone: text})}
            placeholder="+591 7 1234567"
            keyboardType="phone-pad"
          />
        </FormField>

        <FormField>
          <Label>Fecha de Nacimiento</Label>
          <DatePicker
            value={formData.birthDate}
            onChange={date => setFormData({...formData, birthDate: date})}
            maximumDate={new Date()}
          />
        </FormField>

        <FormField>
          <Label>Género</Label>
          <RadioGroup
            options={[
              { value: 'male', label: 'Masculino' },
              { value: 'female', label: 'Femenino' },
              { value: 'other', label: 'Otro' }
            ]}
            value={formData.gender}
            onChange={value => setFormData({...formData, gender: value})}
          />
        </FormField>
      </EditForm>
    ) : (
      <InfoDisplay>
        <InfoRow label="Nombre Completo" value={`${profile.firstName} ${profile.lastName}`} />
        <InfoRow label="Teléfono" value={profile.phone || 'No especificado'} />
        <InfoRow label="Fecha de Nacimiento" value={formatDate(profile.birthDate) || 'No especificado'} />
        <InfoRow label="Género" value={translateGender(profile.gender) || 'No especificado'} />
      </InfoDisplay>
    )}
  </Card>

  <Card style={styles.section}>
    <SectionHeader
      title="Ubicación"
      icon="MapPin"
      onEdit={() => setEditingSection('location')}
      isEditing={editingSection === 'location'}
    />

    {editingSection === 'location' ? (
      <EditForm onSave={handleSaveLocation} onCancel={() => setEditingSection(null)}>
        <FormField>
          <Label>Dirección</Label>
          <Input
            value={formData.address}
            onChangeText={text => setFormData({...formData, address: text})}
            placeholder="Tu dirección"
          />
        </FormField>

        <FormField>
          <Label>Ciudad</Label>
          <Select
            value={formData.city}
            onChange={value => setFormData({...formData, city: value})}
            options={cities}
          />
        </FormField>

        <FormField>
          <Label>Departamento</Label>
          <Select
            value={formData.state}
            onChange={value => setFormData({...formData, state: value})}
            options={states}
          />
        </FormField>

        <FormField>
          <Label>País</Label>
          <Input
            value={formData.country}
            onChangeText={text => setFormData({...formData, country: text})}
            placeholder="Bolivia"
          />
        </FormField>
      </EditForm>
    ) : (
      <InfoDisplay>
        <InfoRow label="Dirección" value={profile.address || 'No especificado'} />
        <InfoRow label="Ciudad" value={profile.city || 'No especificado'} />
        <InfoRow label="Departamento" value={profile.state || 'No especificado'} />
        <InfoRow label="País" value={profile.country || 'No especificado'} />
      </InfoDisplay>
    )}
  </Card>

  <Card style={styles.section}>
    <SectionHeader
      title="Documentación"
      icon="FileText"
      onEdit={() => setEditingSection('documents')}
      isEditing={editingSection === 'documents'}
    />

    {editingSection === 'documents' ? (
      <EditForm onSave={handleSaveDocuments} onCancel={() => setEditingSection(null)}>
        <FormField>
          <Label>Tipo de Documento</Label>
          <Select
            value={formData.documentType}
            onChange={value => setFormData({...formData, documentType: value})}
            options={[
              { value: 'CI', label: 'Cédula de Identidad' },
              { value: 'PASSPORT', label: 'Pasaporte' }
            ]}
          />
        </FormField>

        <FormField>
          <Label>Número de Documento</Label>
          <Input
            value={formData.documentNumber}
            onChangeText={text => setFormData({...formData, documentNumber: text})}
            placeholder="Número de documento"
          />
        </FormField>
      </EditForm>
    ) : (
      <InfoDisplay>
        <InfoRow label="Tipo de Documento" value={translateDocumentType(profile.documentType) || 'No especificado'} />
        <InfoRow label="Número" value={profile.documentNumber || 'No especificado'} />
      </InfoDisplay>
    )}
  </Card>

  <Card style={styles.section}>
    <SectionHeader
      title="Enlaces Sociales"
      icon="Globe"
      onEdit={() => setEditingSection('social')}
      isEditing={editingSection === 'social'}
    />

    {editingSection === 'social' ? (
      <EditForm onSave={handleSaveSocial} onCancel={() => setEditingSection(null)}>
        <FormField>
          <Label>LinkedIn</Label>
          <Input
            value={formData.socialLinks?.linkedin}
            onChangeText={text => setFormData({
              ...formData,
              socialLinks: {...formData.socialLinks, linkedin: text}
            })}
            placeholder="https://linkedin.com/in/tu-perfil"
          />
        </FormField>

        <FormField>
          <Label>GitHub</Label>
          <Input
            value={formData.socialLinks?.github}
            onChangeText={text => setFormData({
              ...formData,
              socialLinks: {...formData.socialLinks, github: text}
            })}
            placeholder="https://github.com/tu-usuario"
          />
        </FormField>

        <FormField>
          <Label>Portafolio</Label>
          <Input
            value={formData.socialLinks?.portfolio}
            onChangeText={text => setFormData({
              ...formData,
              socialLinks: {...formData.socialLinks, portfolio: text}
            })}
            placeholder="https://tu-portafolio.com"
          />
        </FormField>
      </EditForm>
    ) : (
      <InfoDisplay>
        {profile.socialLinks?.linkedin && (
          <SocialLink
            icon="Linkedin"
            label="LinkedIn"
            url={profile.socialLinks.linkedin}
            onPress={() => openURL(profile.socialLinks.linkedin)}
          />
        )}
        {profile.socialLinks?.github && (
          <SocialLink
            icon="Github"
            label="GitHub"
            url={profile.socialLinks.github}
            onPress={() => openURL(profile.socialLinks.github)}
          />
        )}
        {profile.socialLinks?.portfolio && (
          <SocialLink
            icon="Globe"
            label="Portafolio"
            url={profile.socialLinks.portfolio}
            onPress={() => openURL(profile.socialLinks.portfolio)}
          />
        )}
        {!profile.socialLinks?.linkedin && !profile.socialLinks?.github && !profile.socialLinks?.portfolio && (
          <EmptyState
            icon="Globe"
            message="No has agregado enlaces sociales"
            size="small"
          />
        )}
      </InfoDisplay>
    )}
  </Card>
</ScrollView>
```

---

#### 4. Skills Tab
**Componente:** `SkillsTab`

```javascript
<ScrollView style={styles.tabContent}>
  <Card style={styles.section}>
    <SectionHeader
      title="Habilidades Técnicas"
      icon="Code"
      onEdit={() => setEditingSection('skills')}
      isEditing={editingSection === 'skills'}
    />

    {editingSection === 'skills' ? (
      <EditForm onSave={handleSaveSkills} onCancel={() => setEditingSection(null)}>
        <TagInput
          tags={formData.skills}
          onChange={skills => setFormData({...formData, skills})}
          placeholder="Agrega habilidades (presiona Enter)"
          suggestions={skillSuggestions}
        />
        <HelperText>
          Ejemplos: JavaScript, React, Node.js, Python, etc.
        </HelperText>
      </EditForm>
    ) : (
      <View style={styles.tagsContainer}>
        {profile.skills && profile.skills.length > 0 ? (
          profile.skills.map(skill => (
            <Chip key={skill} label={skill} variant="primary" />
          ))
        ) : (
          <EmptyState
            icon="Star"
            message="No has agregado habilidades"
            size="small"
          />
        )}
      </View>
    )}
  </Card>

  <Card style={styles.section}>
    <SectionHeader
      title="Idiomas"
      icon="Globe"
      onEdit={() => setEditingSection('languages')}
      isEditing={editingSection === 'languages'}
    />

    {editingSection === 'languages' ? (
      <EditForm onSave={handleSaveLanguages} onCancel={() => setEditingSection(null)}>
        <TagInput
          tags={formData.languages}
          onChange={languages => setFormData({...formData, languages})}
          placeholder="Agrega idiomas"
          suggestions={languageSuggestions}
        />
      </EditForm>
    ) : (
      <View style={styles.tagsContainer}>
        {profile.languages && profile.languages.length > 0 ? (
          profile.languages.map(language => (
            <Chip key={language} label={language} variant="secondary" />
          ))
        ) : (
          <EmptyState
            icon="Globe"
            message="No has agregado idiomas"
            size="small"
          />
        )}
      </View>
    )}
  </Card>

  <Card style={styles.section}>
    <SectionHeader
      title="Intereses"
      icon="Heart"
      onEdit={() => setEditingSection('interests')}
      isEditing={editingSection === 'interests'}
    />

    {editingSection === 'interests' ? (
      <EditForm onSave={handleSaveInterests} onCancel={() => setEditingSection(null)}>
        <TagInput
          tags={formData.interests}
          onChange={interests => setFormData({...formData, interests})}
          placeholder="Agrega áreas de interés"
          suggestions={interestSuggestions}
        />
      </EditForm>
    ) : (
      <View style={styles.tagsContainer}>
        {profile.interests && profile.interests.length > 0 ? (
          profile.interests.map(interest => (
            <Chip key={interest} label={interest} variant="outline" />
          ))
        ) : (
          <EmptyState
            icon="Heart"
            message="No has agregado intereses"
            size="small"
          />
        )}
      </View>
    )}
  </Card>
</ScrollView>
```

---

### 📊 Flujo de Actualización de Perfil

```
1. User Opens Profile Screen
2. Fetch Profile Data: GET /api/profile/me
3. Display Profile with Sections
4. User Taps "Edit" on Section
5. Show Edit Form with Current Values
6. User Makes Changes
7. User Taps "Save"
8. Validate Form Data
9. Send Update Request:
   - For single section: PATCH /api/profiles { field: value }
   - For multiple sections: PUT /api/profiles { ...allFields }
10. On Success:
    - Update local state
    - Show success message
    - Recalculate profileCompletion
    - Close edit form
11. On Error:
    - Show error message
    - Keep form open for corrections
```

**[Documento continúa con secciones 6-11...]**