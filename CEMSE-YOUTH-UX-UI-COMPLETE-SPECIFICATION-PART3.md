# CEMSE YOUTH USER - Complete UX/UI Specification (PART 3)

## 📱 Continuación de la Guía Completa de UX/UI

**Este documento es la continuación de:** `CEMSE-YOUTH-UX-UI-COMPLETE-SPECIFICATION-PART2.md`

---

## 8. Certificados (Certificates)

### 📍 Ruta
```
Web: /certificates
Mobile: CertificatesScreen
```

### 🔌 API Endpoints

```javascript
// 1. Obtener certificados del usuario
GET /api/certificates

Response: {
  success: true,
  certificates: [
    {
      id: "string",
      type: "course" | "module",
      certificateUrl: "string", // URL para descargar PDF
      issuedAt: "ISO string",
      course: {
        id: "string",
        title: "string",
        duration: number,
        instructor: {
          firstName: "string",
          lastName: "string"
        }
      },
      module?: {
        id: "string",
        title: "string"
      },
      student: {
        id: "string",
        name: "string",
        email: "string"
      },
      verificationCode: "string", // Código único de verificación
      institution: {
        name: "string",
        logo: "string"
      }
    }
  ]
}

// 2. Verificar estado del certificado para un curso
GET /api/courses/{id}/certificate

Response: {
  success: true,
  eligible: boolean,
  certificate?: {
    id: "string",
    certificateUrl: "string"
  },
  requirements: {
    completionPercentage: number,
    requiredPercentage: number,
    quizzesPassed: number,
    quizzesRequired: number
  }
}

// 3. Generar certificado (si es elegible)
POST /api/courses/{id}/certificate

Response: {
  success: true,
  certificate: {
    id: "string",
    certificateUrl: "string",
    verificationCode: "string"
  }
}

// 4. Descargar certificado
GET /api/certificates/{id}/download

// 5. Verificar certificado por código
GET /api/certificates/verify/{verificationCode}

Response: {
  success: true,
  valid: boolean,
  certificate: {
    studentName: "string",
    courseName: "string",
    issuedAt: "ISO string",
    institutionName: "string"
  }
}
```

### 🎨 Componentes UI

#### 1. Certificates Header
**Componente:** `CertificatesHeader`

```javascript
<View style={styles.certificatesHeader}>
  <Text style={styles.title}>Mis Certificados</Text>
  <Text style={styles.subtitle}>
    Certificados de cursos y módulos completados
  </Text>

  {/* Stats Cards */}
  <View style={styles.statsGrid}>
    <StatCard
      icon="Award"
      iconColor="#F59E0B"
      value={certificates.length}
      label="Total Certificados"
    />
    <StatCard
      icon="GraduationCap"
      iconColor="#3B82F6"
      value={courseCertificates.length}
      label="Cursos Completados"
    />
    <StatCard
      icon="BookOpen"
      iconColor="#10B981"
      value={moduleCertificates.length}
      label="Módulos Completados"
    />
  </View>
</View>
```

---

#### 2. Certificate Tabs
**Componente:** `CertificateTabs`

```javascript
<Tabs>
  <Tab label={`Todos (${certificates.length})`}>
    <CertificatesGrid certificates={certificates} />
  </Tab>

  <Tab label={`Cursos (${courseCertificates.length})`}>
    <CertificatesGrid certificates={courseCertificates} />
  </Tab>

  <Tab label={`Módulos (${moduleCertificates.length})`}>
    <CertificatesGrid certificates={moduleCertificates} />
  </Tab>
</Tabs>
```

---

#### 3. Certificate Card
**Componente:** `CertificateCard`

```javascript
<TouchableOpacity
  style={styles.certificateCard}
  onPress={() => handleViewCertificate(certificate)}
>
  {/* Certificate Preview */}
  <View style={styles.certificatePreview}>
    <ImageBackground
      source={require('./assets/certificate-bg.png')}
      style={styles.previewBackground}
    >
      <View style={styles.certificateContent}>
        <Icon name="Award" size={48} color="#F59E0B" />
        <Text style={styles.certificationType}>
          {certificate.type === 'course' ? 'Certificado de Curso' : 'Certificado de Módulo'}
        </Text>
        <Text style={styles.certificateTitle} numberOfLines={2}>
          {certificate.course.title}
        </Text>
        {certificate.module && (
          <Text style={styles.moduleTitle}>
            Módulo: {certificate.module.title}
          </Text>
        )}
      </View>
    </ImageBackground>
  </View>

  {/* Certificate Info */}
  <View style={styles.certificateInfo}>
    <View style={styles.infoRow}>
      <Icon name="User" size={16} color="#6B7280" />
      <Text style={styles.infoText}>{certificate.student.name}</Text>
    </View>

    <View style={styles.infoRow}>
      <Icon name="Calendar" size={16} color="#6B7280" />
      <Text style={styles.infoText}>
        Emitido: {formatDate(certificate.issuedAt)}
      </Text>
    </View>

    <View style={styles.infoRow}>
      <Icon name="Clock" size={16} color="#6B7280" />
      <Text style={styles.infoText}>
        Duración: {formatDuration(certificate.course.duration)}
      </Text>
    </View>

    <View style={styles.infoRow}>
      <Icon name="Shield" size={16} color="#6B7280" />
      <Text style={styles.infoText} numberOfLines={1}>
        Código: {certificate.verificationCode}
      </Text>
    </View>
  </View>

  {/* Actions */}
  <View style={styles.certificateActions}>
    <Button
      variant="outline"
      size="small"
      onPress={(e) => {
        e.stopPropagation();
        handleViewCertificate(certificate);
      }}
    >
      <Icon name="Eye" size={16} />
      <Text>Ver</Text>
    </Button>

    <Button
      variant="outline"
      size="small"
      onPress={(e) => {
        e.stopPropagation();
        handleDownloadCertificate(certificate);
      }}
    >
      <Icon name="Download" size={16} />
      <Text>Descargar</Text>
    </Button>

    <Button
      size="small"
      onPress={(e) => {
        e.stopPropagation();
        handleShareCertificate(certificate);
      }}
    >
      <Icon name="Share" size={16} />
      <Text>Compartir</Text>
    </Button>
  </View>
</TouchableOpacity>
```

---

#### 4. Certificate Viewer Modal
**Componente:** `CertificateViewerModal`

```javascript
<Modal
  visible={showViewer}
  animationType="slide"
  onRequestClose={onClose}
>
  <View style={styles.viewerContainer}>
    {/* Header */}
    <View style={styles.viewerHeader}>
      <TouchableOpacity style={styles.closeButton} onPress={onClose}>
        <Icon name="X" size={24} />
      </TouchableOpacity>
      <Text style={styles.viewerTitle}>Certificado</Text>
      <TouchableOpacity
        style={styles.shareButton}
        onPress={() => handleShare(certificate)}
      >
        <Icon name="Share" size={24} />
      </TouchableOpacity>
    </View>

    {/* Certificate Display */}
    <ScrollView
      style={styles.certificateContainer}
      contentContainerStyle={styles.certificateContentContainer}
      maximumZoomScale={3}
      minimumZoomScale={1}
    >
      {/* Certificate Full View */}
      <View style={styles.certificateFull}>
        <Image
          source={{ uri: certificate.certificateUrl }}
          style={styles.certificateImage}
          resizeMode="contain"
        />
      </View>

      {/* Certificate Details */}
      <Card style={styles.detailsCard}>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Nombre del Estudiante:</Text>
          <Text style={styles.detailValue}>{certificate.student.name}</Text>
        </View>

        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Curso:</Text>
          <Text style={styles.detailValue}>{certificate.course.title}</Text>
        </View>

        {certificate.module && (
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Módulo:</Text>
            <Text style={styles.detailValue}>{certificate.module.title}</Text>
          </View>
        )}

        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Instructor:</Text>
          <Text style={styles.detailValue}>
            {certificate.course.instructor.firstName} {certificate.course.instructor.lastName}
          </Text>
        </View>

        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Fecha de Emisión:</Text>
          <Text style={styles.detailValue}>
            {formatDate(certificate.issuedAt)}
          </Text>
        </View>

        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Código de Verificación:</Text>
          <View style={styles.verificationCode}>
            <Text style={styles.codeText}>{certificate.verificationCode}</Text>
            <TouchableOpacity
              onPress={() => copyToClipboard(certificate.verificationCode)}
            >
              <Icon name="Copy" size={16} />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.verificationInfo}>
          <Icon name="Shield" size={20} color="#10B981" />
          <Text style={styles.verificationText}>
            Este certificado puede ser verificado en línea usando el código de verificación
          </Text>
        </View>
      </Card>
    </ScrollView>

    {/* Actions */}
    <View style={styles.viewerActions}>
      <Button
        variant="outline"
        onPress={onClose}
        style={styles.actionButton}
      >
        Cerrar
      </Button>

      <Button
        onPress={() => handleDownload(certificate)}
        style={styles.actionButton}
      >
        <Icon name="Download" size={18} />
        <Text>Descargar PDF</Text>
      </Button>

      <Button
        variant="success"
        onPress={() => handleShare(certificate)}
        style={styles.actionButton}
      >
        <Icon name="Share" size={18} />
        <Text>Compartir</Text>
      </Button>
    </View>
  </View>
</Modal>
```

---

#### 5. Empty State
**Componente:** `CertificatesEmptyState`

```javascript
<View style={styles.emptyState}>
  <Icon name="Award" size={64} color="#D1D5DB" />
  <Text style={styles.emptyTitle}>No tienes certificados aún</Text>
  <Text style={styles.emptyMessage}>
    Completa cursos para obtener certificados oficiales
  </Text>
  <Button
    onPress={() => navigation.navigate('Courses')}
    style={styles.emptyAction}
  >
    <Icon name="GraduationCap" size={20} />
    <Text>Explorar Cursos</Text>
  </Button>
</View>
```

---

### 📊 Flujo de Certificados

```
1. User Completes Course (100% progress + quizzes passed)
2. System automatically generates certificate or user requests it
3. POST /api/courses/{courseId}/certificate
4. Certificate is generated with:
   - Unique verification code
   - Student name and details
   - Course information
   - Institution logo and signature
   - Issue date
5. User receives notification
6. User navigates to Certificates screen
7. User views/downloads/shares certificate
8. Share options:
   - Share URL with verification code
   - Download PDF
   - Share to social media (LinkedIn, etc.)
   - Email certificate
```

---

## 9. Recursos (Resources)

### 📍 Ruta
```
Web: /resources
Mobile: ResourcesScreen
```

### 🔌 API Endpoints

```javascript
// 1. Listar recursos
GET /api/resources?search={term}&category={category}&type={type}

Response: {
  success: true,
  resources: [
    {
      id: "string",
      title: "string",
      description: "string",
      type: "PDF" | "DOC" | "PPT" | "XLS" | "Video" | "ZIP" | "Image" | "URL",
      category: "string",
      tags: string[],
      downloadUrl: "string",
      externalUrl?: "string",
      fileSize?: number, // en bytes
      duration?: number, // para videos, en segundos
      thumbnailUrl?: "string",
      status: "PUBLISHED" | "DRAFT" | "ARCHIVED",
      downloads: number,
      views: number,
      createdBy: {
        firstName: "string",
        lastName: "string",
        institutionName?: "string"
      },
      createdAt: "ISO string",
      publishedDate: "ISO string"
    }
  ]
}

// 2. Obtener detalle de recurso
GET /api/resources/{id}

// 3. Descargar recurso
GET /api/resources/{id}/download

// 4. Registrar vista de recurso
POST /api/resources/{id}/view

// 5. Obtener recursos por categoría
GET /api/resources?category={category}
```

### 🎨 Componentes UI

#### 1. Resources Header with Filters
**Componente:** `ResourcesHeader`

```javascript
<View style={styles.resourcesHeader}>
  <Text style={styles.title}>Recursos</Text>
  <Text style={styles.subtitle}>
    Materiales educativos y herramientas de apoyo
  </Text>

  {/* Search Bar */}
  <View style={styles.searchBar}>
    <Icon name="Search" size={20} color="#9CA3AF" />
    <TextInput
      placeholder="Buscar recursos..."
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

  {/* Filters */}
  <View style={styles.filtersRow}>
    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
      <FilterChip
        label="Todos"
        active={typeFilter === 'all'}
        onPress={() => setTypeFilter('all')}
      />
      <FilterChip
        label="Documentos"
        icon="FileText"
        active={typeFilter === 'documents'}
        onPress={() => setTypeFilter('documents')}
        count={documentsCount}
      />
      <FilterChip
        label="Videos"
        icon="Video"
        active={typeFilter === 'videos'}
        onPress={() => setTypeFilter('videos')}
        count={videosCount}
      />
      <FilterChip
        label="Enlaces"
        icon="Link"
        active={typeFilter === 'links'}
        onPress={() => setTypeFilter('links')}
        count={linksCount}
      />
    </ScrollView>
  </View>

  {/* Stats */}
  <View style={styles.statsGrid}>
    <StatCard
      icon="FileText"
      iconColor="#3B82F6"
      value={resources.length}
      label="Total Recursos"
    />
    <StatCard
      icon="Download"
      iconColor="#10B981"
      value={totalDownloads}
      label="Descargas"
    />
    <StatCard
      icon="Tag"
      iconColor="#F59E0B"
      value={categories.length}
      label="Categorías"
    />
  </View>
</View>
```

---

#### 2. Resource Card
**Componente:** `ResourceCard`

```javascript
<TouchableOpacity
  style={styles.resourceCard}
  onPress={() => handleViewResource(resource)}
>
  {/* Resource Icon/Thumbnail */}
  <View style={styles.resourceThumbnail}>
    {resource.thumbnailUrl ? (
      <Image
        source={{ uri: resource.thumbnailUrl }}
        style={styles.thumbnail}
      />
    ) : (
      <View style={[styles.iconContainer, { backgroundColor: getTypeColor(resource.type).light }]}>
        <Icon
          name={getTypeIcon(resource.type)}
          size={32}
          color={getTypeColor(resource.type).dark}
        />
      </View>
    )}

    {/* Type Badge */}
    <View style={[styles.typeBadge, { backgroundColor: getTypeColor(resource.type).dark }]}>
      <Text style={styles.typeText}>{resource.type}</Text>
    </View>
  </View>

  {/* Resource Info */}
  <View style={styles.resourceInfo}>
    <View style={styles.categoryBadge}>
      <Badge label={resource.category} size="small" variant="outline" />
    </View>

    <Text style={styles.resourceTitle} numberOfLines={2}>
      {resource.title}
    </Text>

    <Text style={styles.resourceDescription} numberOfLines={3}>
      {resource.description}
    </Text>

    {/* Tags */}
    {resource.tags.length > 0 && (
      <View style={styles.tagsContainer}>
        {resource.tags.slice(0, 3).map(tag => (
          <Chip key={tag} label={tag} size="small" variant="secondary" />
        ))}
        {resource.tags.length > 3 && (
          <Chip label={`+${resource.tags.length - 3}`} size="small" variant="secondary" />
        )}
      </View>
    )}

    {/* Meta Information */}
    <View style={styles.resourceMeta}>
      <View style={styles.metaItem}>
        <Icon name="User" size={14} color="#6B7280" />
        <Text style={styles.metaText}>
          {resource.createdBy.firstName} {resource.createdBy.lastName}
        </Text>
      </View>

      {resource.fileSize && (
        <View style={styles.metaItem}>
          <Icon name="File" size={14} color="#6B7280" />
          <Text style={styles.metaText}>
            {formatFileSize(resource.fileSize)}
          </Text>
        </View>
      )}

      {resource.duration && (
        <View style={styles.metaItem}>
          <Icon name="Clock" size={14} color="#6B7280" />
          <Text style={styles.metaText}>
            {formatDuration(resource.duration)}
          </Text>
        </View>
      )}
    </View>

    {/* Stats */}
    <View style={styles.resourceStats}>
      <View style={styles.statItem}>
        <Icon name="Download" size={16} color="#6B7280" />
        <Text style={styles.statValue}>{resource.downloads}</Text>
      </View>
      <View style={styles.statDivider} />
      <View style={styles.statItem}>
        <Icon name="Eye" size={16} color="#6B7280" />
        <Text style={styles.statValue}>{resource.views}</Text>
      </View>
      <View style={styles.statDivider} />
      <View style={styles.statItem}>
        <Icon name="Calendar" size={16} color="#6B7280" />
        <Text style={styles.statValue}>
          {formatRelativeTime(resource.publishedDate)}
        </Text>
      </View>
    </View>
  </View>

  {/* Actions */}
  <View style={styles.resourceActions}>
    <Button
      variant="outline"
      size="small"
      onPress={(e) => {
        e.stopPropagation();
        handleViewResource(resource);
      }}
    >
      <Icon name="Eye" size={16} />
      <Text>Ver</Text>
    </Button>

    <Button
      size="small"
      onPress={(e) => {
        e.stopPropagation();
        handleDownloadResource(resource);
      }}
    >
      <Icon name="Download" size={16} />
      <Text>Descargar</Text>
    </Button>
  </View>
</TouchableOpacity>
```

**Helpers:**
```javascript
const getTypeIcon = (type) => {
  const icons = {
    PDF: 'FileText',
    DOC: 'FileText',
    PPT: 'Presentation',
    XLS: 'Table',
    Video: 'Video',
    ZIP: 'Archive',
    Image: 'Image',
    URL: 'Link'
  };
  return icons[type] || 'File';
};

const getTypeColor = (type) => {
  const colors = {
    PDF: { light: '#FEE2E2', dark: '#EF4444' },
    DOC: { light: '#DBEAFE', dark: '#3B82F6' },
    PPT: { light: '#FEF3C7', dark: '#F59E0B' },
    XLS: { light: '#D1FAE5', dark: '#10B981' },
    Video: { light: '#E0E7FF', dark: '#6366F1' },
    ZIP: { light: '#F3E8FF', dark: '#8B5CF6' },
    Image: { light: '#FCE7F3', dark: '#EC4899' },
    URL: { light: '#FED7AA', dark: '#EA580C' }
  };
  return colors[type] || { light: '#F3F4F6', dark: '#6B7280' };
};

const formatFileSize = (bytes) => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};
```

---

#### 3. Resource Detail Modal
**Componente:** `ResourceDetailModal`

```javascript
<Modal
  visible={showDetail}
  animationType="slide"
  onRequestClose={onClose}
>
  <View style={styles.detailContainer}>
    {/* Header */}
    <View style={styles.detailHeader}>
      <TouchableOpacity style={styles.closeButton} onPress={onClose}>
        <Icon name="X" size={24} />
      </TouchableOpacity>
      <Text style={styles.headerTitle}>Detalles del Recurso</Text>
      <View style={{ width: 40 }} />
    </View>

    <ScrollView style={styles.detailContent}>
      {/* Resource Preview */}
      <View style={styles.previewContainer}>
        {resource.type === 'Video' ? (
          <VideoPlayer
            source={{ uri: resource.downloadUrl }}
            style={styles.videoPreview}
          />
        ) : resource.type === 'Image' ? (
          <Image
            source={{ uri: resource.downloadUrl }}
            style={styles.imagePreview}
            resizeMode="contain"
          />
        ) : (
          <View style={[styles.filePreview, { backgroundColor: getTypeColor(resource.type).light }]}>
            <Icon
              name={getTypeIcon(resource.type)}
              size={64}
              color={getTypeColor(resource.type).dark}
            />
            <Text style={styles.fileType}>{resource.type}</Text>
          </View>
        )}
      </View>

      {/* Resource Info */}
      <View style={styles.infoSection}>
        <Text style={styles.resourceTitle}>{resource.title}</Text>

        <View style={styles.badgesRow}>
          <Badge label={resource.category} variant="primary" />
          <Badge label={resource.type} variant="secondary" />
        </View>

        <Text style={styles.resourceDescription}>{resource.description}</Text>

        {/* Tags */}
        {resource.tags.length > 0 && (
          <View style={styles.tagsSection}>
            <Text style={styles.sectionTitle}>Etiquetas</Text>
            <View style={styles.tagsGrid}>
              {resource.tags.map(tag => (
                <Chip key={tag} label={tag} variant="outline" />
              ))}
            </View>
          </View>
        )}

        {/* Details */}
        <View style={styles.detailsSection}>
          <Text style={styles.sectionTitle}>Información</Text>

          <DetailRow
            icon="User"
            label="Creado por"
            value={`${resource.createdBy.firstName} ${resource.createdBy.lastName}`}
          />

          {resource.createdBy.institutionName && (
            <DetailRow
              icon="Building"
              label="Institución"
              value={resource.createdBy.institutionName}
            />
          )}

          <DetailRow
            icon="Calendar"
            label="Publicado"
            value={formatDate(resource.publishedDate)}
          />

          {resource.fileSize && (
            <DetailRow
              icon="File"
              label="Tamaño"
              value={formatFileSize(resource.fileSize)}
            />
          )}

          {resource.duration && (
            <DetailRow
              icon="Clock"
              label="Duración"
              value={formatDuration(resource.duration)}
            />
          )}

          <DetailRow
            icon="Download"
            label="Descargas"
            value={resource.downloads.toLocaleString()}
          />

          <DetailRow
            icon="Eye"
            label="Vistas"
            value={resource.views.toLocaleString()}
          />
        </View>
      </View>
    </ScrollView>

    {/* Actions */}
    <View style={styles.detailActions}>
      <Button
        variant="outline"
        onPress={() => handleShare(resource)}
        style={styles.actionButton}
      >
        <Icon name="Share" size={18} />
        <Text>Compartir</Text>
      </Button>

      <Button
        onPress={() => handleDownload(resource)}
        style={styles.downloadButton}
      >
        <Icon name="Download" size={18} />
        <Text>Descargar</Text>
      </Button>
    </View>
  </View>
</Modal>
```

---

### 📊 Flujo de Recursos

```
1. User Opens Resources Screen
2. Fetch Resources: GET /api/resources
3. Display Resources with Filters
4. User Applies Filters (type, category, search)
5. User Taps on Resource Card
6. Show Resource Detail Modal
7. Register View: POST /api/resources/{id}/view
8. User Can:
   - View resource details
   - Download resource
   - Share resource link
9. On Download:
   - GET /api/resources/{id}/download
   - Increment downloads counter
   - Save to device
10. Show download success/failure
```

---

## 10. Hub de Emprendimiento (Entrepreneurship)

### 📍 Ruta
```
Web: /entrepreneurship
Mobile: EntrepreneurshipScreen
```

### 🔌 API Endpoints

```javascript
// 1. Obtener planes de negocio del usuario
GET /api/business-plans?limit={number}

Response: {
  success: true,
  businessPlans: [
    {
      id: "string",
      title: "string",
      description: "string",
      industry: "string",
      status: "draft" | "completed" | "published",
      completionPercentage: number, // 0-100
      sections: {
        executiveSummary: "string",
        companyDescription: "string",
        marketAnalysis: "string",
        organizationManagement: "string",
        serviceProductLine: "string",
        marketingStrategy: "string",
        fundingRequest: "string",
        financialProjections: object,
        appendix: "string"
      },
      createdAt: "ISO string",
      updatedAt: "ISO string"
    }
  ]
}

// 2. Crear plan de negocio
POST /api/business-plans
Body: {
  title: "string",
  description: "string",
  industry: "string"
}

// 3. Actualizar plan de negocio
PUT /api/business-plans/{id}
Body: {
  title: "string",
  sections: object,
  completionPercentage: number
}

// 4. Obtener plan de negocio específico
GET /api/business-plans/{id}

// 5. Eliminar plan de negocio
DELETE /api/business-plans/{id}

// 6. Obtener noticias de emprendimiento (del módulo News filtrado)
GET /api/news?category=Emprendimiento&limit=6

// 7. Obtener recursos de emprendimiento (del módulo Resources filtrado)
GET /api/resources?category=Emprendimiento&limit=6

// 8. Obtener mis emprendimientos
GET /api/entrepreneurships?userId={userId}&limit=3

Response: {
  success: true,
  entrepreneurships: [
    {
      id: "string",
      name: "string",
      logo: "string",
      category: "string",
      businessStage: "string",
      viewsCount: number,
      isActive: boolean
    }
  ]
}
```

### 🎨 Componentes UI

#### 1. Entrepreneurship Hero Section
**Componente:** `EntrepreneurshipHero`

```javascript
<View style={styles.heroSection}>
  <LinearGradient
    colors={['#8B5CF6', '#6366F1', '#3B82F6']}
    start={{ x: 0, y: 0 }}
    end={{ x: 1, y: 1 }}
    style={styles.gradient}
  >
    <View style={styles.heroContent}>
      <Icon name="Lightbulb" size={48} color="#fff" />
      <Text style={styles.heroTitle}>Centro de Emprendimiento</Text>
      <Text style={styles.heroSubtitle}>
        Transforma tus ideas en negocios exitosos. Accede a herramientas, recursos y una comunidad de emprendedores
      </Text>
    </View>
  </LinearGradient>
</View>
```

---

#### 2. Quick Actions Grid
**Componente:** `EntrepreneurshipQuickActions`

```javascript
const quickActions = [
  {
    title: 'Plan de Negocio',
    description: businessPlansData?.businessPlans?.length > 0
      ? 'Continúa editando tu plan de negocio'
      : 'Crea y gestiona tu plan de negocio paso a paso',
    icon: 'FileText',
    iconColor: '#8B5CF6',
    backgroundColor: '#F3E8FF',
    action: () => handleBusinessPlanAction()
  },
  {
    title: 'Calculadora Financiera',
    description: 'Calcula métricas financieras y proyecciones',
    icon: 'Calculator',
    iconColor: '#3B82F6',
    backgroundColor: '#DBEAFE',
    action: () => setShowFinancialCalculator(true)
  },
  {
    title: 'Red de Emprendedores',
    description: 'Conecta con otros emprendedores y mentores',
    icon: 'Users',
    iconColor: '#10B981',
    backgroundColor: '#D1FAE5',
    action: () => navigation.navigate('EntrepreneurshipNetwork')
  },
  {
    title: 'Business Model Canvas',
    description: 'Diseña tu modelo de negocio visualmente',
    icon: 'BarChart3',
    iconColor: '#F59E0B',
    backgroundColor: '#FEF3C7',
    action: () => setShowBusinessModelCanvas(true)
  }
];

<View style={styles.quickActionsGrid}>
  {quickActions.map((action, index) => (
    <TouchableOpacity
      key={index}
      style={styles.actionCard}
      onPress={action.action}
    >
      <View style={[styles.iconContainer, { backgroundColor: action.backgroundColor }]}>
        <Icon name={action.icon} size={32} color={action.iconColor} />
      </View>
      <Text style={styles.actionTitle}>{action.title}</Text>
      <Text style={styles.actionDescription} numberOfLines={2}>
        {action.description}
      </Text>
    </TouchableOpacity>
  ))}
</View>
```

---

#### 3. Entrepreneurship Tabs
**Componente:** `EntrepreneurshipTabs`

```javascript
<Tabs>
  <Tab label="Resumen" icon="Home">
    <OverviewTab
      businessPlans={businessPlans}
      news={entrepreneurshipNews}
      resources={featuredResources}
      myProjects={myEntrepreneurships}
    />
  </Tab>

  <Tab label="Noticias" icon="Globe">
    <NewsTab news={entrepreneurshipNews} />
  </Tab>

  <Tab label="Recursos" icon="BookOpen">
    <ResourcesTab resources={featuredResources} />
  </Tab>

  <Tab label="Mis Proyectos" icon="Building2">
    <ProjectsTab projects={myEntrepreneurships} />
  </Tab>
</Tabs>
```

---

#### 4. Business Plan Card
**Componente:** `BusinessPlanCard`

```javascript
<Card style={styles.businessPlanCard}>
  <View style={styles.planHeader}>
    <View style={styles.planInfo}>
      <Text style={styles.planTitle}>{plan.title || 'Plan de Negocio'}</Text>
      <Badge
        label={plan.status === 'draft' ? 'Borrador' : 'Completado'}
        variant={plan.status === 'draft' ? 'warning' : 'success'}
      />
    </View>
    <TouchableOpacity
      style={styles.menuButton}
      onPress={() => openPlanMenu(plan.id)}
    >
      <Icon name="MoreVertical" size={20} />
    </TouchableOpacity>
  </View>

  {plan.description && (
    <Text style={styles.planDescription} numberOfLines={2}>
      {plan.description}
    </Text>
  )}

  <View style={styles.planProgress}>
    <View style={styles.progressHeader}>
      <Text style={styles.progressLabel}>Progreso</Text>
      <Text style={styles.progressPercent}>
        {plan.completionPercentage}%
      </Text>
    </View>
    <ProgressBar
      progress={plan.completionPercentage / 100}
      color="#8B5CF6"
    />
  </View>

  <View style={styles.planMeta}>
    <View style={styles.metaItem}>
      <Icon name="Briefcase" size={16} color="#6B7280" />
      <Text style={styles.metaText}>{plan.industry || 'Sin industria'}</Text>
    </View>
    <View style={styles.metaItem}>
      <Icon name="Calendar" size={16} color="#6B7280" />
      <Text style={styles.metaText}>
        Actualizado: {formatRelativeTime(plan.updatedAt)}
      </Text>
    </View>
  </View>

  <View style={styles.planActions}>
    <Button
      variant="outline"
      size="small"
      onPress={() => handleEditPlan(plan)}
    >
      <Icon name="Edit" size={16} />
      <Text>Editar</Text>
    </Button>

    <Button
      size="small"
      onPress={() => handleViewPlan(plan)}
    >
      <Icon name="Eye" size={16} />
      <Text>Ver Plan</Text>
    </Button>
  </View>
</Card>
```

---

#### 5. Financial Calculator Modal
**Componente:** `FinancialCalculatorModal`

```javascript
<Modal
  visible={showCalculator}
  animationType="slide"
  onRequestClose={() => setShowCalculator(false)}
>
  <View style={styles.calculatorContainer}>
    <View style={styles.calculatorHeader}>
      <TouchableOpacity onPress={() => setShowCalculator(false)}>
        <Icon name="X" size={24} />
      </TouchableOpacity>
      <Text style={styles.headerTitle}>Calculadora Financiera</Text>
      <View style={{ width: 40 }} />
    </View>

    <ScrollView style={styles.calculatorContent}>
      {/* Investment Section */}
      <Card style={styles.calculatorSection}>
        <Text style={styles.sectionTitle}>Inversión Inicial</Text>
        <FormField>
          <Label>Monto de Inversión (BOB)</Label>
          <Input
            keyboardType="numeric"
            value={financialData.initialInvestment}
            onChangeText={(value) => updateFinancialData('initialInvestment', value)}
            placeholder="0"
          />
        </FormField>
      </Card>

      {/* Operating Costs */}
      <Card style={styles.calculatorSection}>
        <Text style={styles.sectionTitle}>Costos Operativos</Text>
        <FormField>
          <Label>Costos Mensuales (BOB)</Label>
          <Input
            keyboardType="numeric"
            value={financialData.monthlyOperatingCosts}
            onChangeText={(value) => updateFinancialData('monthlyOperatingCosts', value)}
            placeholder="0"
          />
        </FormField>
      </Card>

      {/* Revenue Projection */}
      <Card style={styles.calculatorSection}>
        <Text style={styles.sectionTitle}>Proyección de Ingresos</Text>
        <FormField>
          <Label>Ingresos Mensuales Estimados (BOB)</Label>
          <Input
            keyboardType="numeric"
            value={financialData.revenueProjection}
            onChangeText={(value) => updateFinancialData('revenueProjection', value)}
            placeholder="0"
          />
        </FormField>
      </Card>

      {/* Calculations Results */}
      <Card style={styles.resultsCard}>
        <Text style={styles.resultsTitle}>Resultados</Text>

        <View style={styles.resultItem}>
          <Text style={styles.resultLabel}>Punto de Equilibrio:</Text>
          <Text style={styles.resultValue}>
            {calculateBreakEven()} meses
          </Text>
        </View>

        <View style={styles.resultItem}>
          <Text style={styles.resultLabel}>ROI Estimado (12 meses):</Text>
          <Text style={[
            styles.resultValue,
            calculateROI() > 0 ? styles.positive : styles.negative
          ]}>
            {calculateROI()}%
          </Text>
        </View>

        <View style={styles.resultItem}>
          <Text style={styles.resultLabel}>Ganancia Mensual:</Text>
          <Text style={[
            styles.resultValue,
            calculateMonthlyProfit() > 0 ? styles.positive : styles.negative
          ]}>
            {calculateMonthlyProfit()} BOB
          </Text>
        </View>

        <View style={styles.resultItem}>
          <Text style={styles.resultLabel}>Ganancia Anual:</Text>
          <Text style={[
            styles.resultValue,
            calculateYearlyProfit() > 0 ? styles.positive : styles.negative
          ]}>
            {calculateYearlyProfit()} BOB
          </Text>
        </View>
      </Card>

      {/* Chart */}
      <Card style={styles.chartCard}>
        <Text style={styles.chartTitle}>Proyección Anual</Text>
        <LineChart
          data={generateChartData()}
          width={screenWidth - 60}
          height={220}
          chartConfig={chartConfig}
          bezier
        />
      </Card>
    </ScrollView>

    <View style={styles.calculatorActions}>
      <Button
        variant="outline"
        onPress={() => resetCalculator()}
      >
        Limpiar
      </Button>
      <Button
        onPress={() => saveCalculations()}
      >
        Guardar
      </Button>
    </View>
  </View>
</Modal>
```

---

### 📊 Flujo de Emprendimiento

```
1. User Opens Entrepreneurship Hub
2. Fetch Data:
   - GET /api/business-plans
   - GET /api/news?category=Emprendimiento
   - GET /api/resources?category=Emprendimiento
   - GET /api/entrepreneurships?userId={userId}
3. Display Overview with Quick Actions
4. User Can:
   - Create/Edit Business Plan
   - Use Financial Calculator
   - Access Networking Hub
   - Create Business Model Canvas
   - View Entrepreneurship News
   - Download Resources
5. Business Plan Flow:
   - Tap "Plan de Negocio"
   - If exists: Load existing plan
   - If not: Create new plan
   - Show Business Plan Builder
   - User fills sections
   - Auto-save progress
   - Calculate completion percentage
6. Financial Calculator:
   - Input investment amounts
   - Input operating costs
   - Input revenue projections
   - Calculate:
     - Break-even point
     - ROI
     - Monthly/Yearly profit
   - Display charts
   - Save calculations
```

---

## 11. Noticias (News)

### 📍 Ruta
```
Web: /news
Mobile: NewsScreen
```

### 🔌 API Endpoints

```javascript
// 1. Listar noticias
GET /api/news?search={term}&category={category}&status={status}

Response: {
  success: true,
  articles: [
    {
      id: "string",
      title: "string",
      content: "string", // HTML content
      summary: "string",
      imageUrl: "string",
      videoUrl?: "string",
      category: "string",
      tags: string[],
      priority: "HIGH" | "MEDIUM" | "LOW" | "URGENT",
      status: "PUBLISHED" | "DRAFT" | "ARCHIVED",
      featured: boolean,
      isPublished: boolean,
      publishedAt: "ISO string",
      viewCount: number,
      likeCount: number,
      commentCount: number,
      author: {
        id: "string",
        name: "string",
        avatar: "string",
        role: "string"
      },
      authorType: "INSTITUTION" | "COMPANY" | "ADMIN",
      authorName: "string",
      createdAt: "ISO string",
      updatedAt: "ISO string"
    }
  ]
}

// 2. Obtener detalle de noticia
GET /api/news/{id}

// 3. Registrar vista de noticia
POST /api/news/{id}/view

// 4. Like a noticia (si aplica)
POST /api/news/{id}/like

// 5. Obtener noticias por categoría
GET /api/news?category={category}

// 6. Obtener noticias destacadas
GET /api/news?featured=true

// 7. Obtener categorías de noticias
GET /api/news/categories

Response: {
  success: true,
  categories: string[]
}
```

### 🎨 Componentes UI

#### 1. News Header
**Componente:** `NewsHeader`

```javascript
<View style={styles.newsHeader}>
  <Text style={styles.title}>Noticias</Text>
  <Text style={styles.subtitle}>
    Mantente informado con las últimas noticias y actualizaciones
  </Text>

  {/* Search Bar */}
  <View style={styles.searchBar}>
    <Icon name="Search" size={20} color="#9CA3AF" />
    <TextInput
      placeholder="Buscar noticias..."
      value={searchTerm}
      onChangeText={setSearchTerm}
      style={styles.searchInput}
    />
  </View>

  {/* Stats */}
  <View style={styles.statsGrid}>
    <StatCard
      icon="Globe"
      iconColor="#3B82F6"
      value={newsArticles.length}
      label="Total Noticias"
    />
    <StatCard
      icon="Eye"
      iconColor="#10B981"
      value={totalViews}
      label="Vistas Totales"
    />
    <StatCard
      icon="Heart"
      iconColor="#EF4444"
      value={totalLikes}
      label="Interacciones"
    />
    <StatCard
      icon="Star"
      iconColor="#F59E0B"
      value={featuredCount}
      label="Destacadas"
    />
  </View>

  {/* Category Tabs */}
  <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryTabs}>
    {categories.map(category => (
      <CategoryTab
        key={category.id}
        label={category.name}
        count={category.count}
        active={selectedCategory === category.id}
        onPress={() => setSelectedCategory(category.id)}
      />
    ))}
  </ScrollView>
</View>
```

**Categories:**
```javascript
const categories = [
  { id: "all", name: "Todos", count: newsArticles.length },
  { id: "Empleo", name: "Empleo" },
  { id: "Educación", name: "Educación" },
  { id: "Emprendimiento", name: "Emprendimiento" },
  { id: "Tecnología", name: "Tecnología" },
  { id: "Salud", name: "Salud" },
  { id: "Cultura", name: "Cultura" },
  { id: "Local", name: "Local" }
];
```

---

#### 2. News Card
**Componente:** `NewsCard`

```javascript
<TouchableOpacity
  style={styles.newsCard}
  onPress={() => handleViewNews(article)}
>
  {/* Article Image */}
  <View style={styles.imageContainer}>
    <Image
      source={{ uri: article.imageUrl || defaultImage }}
      style={styles.articleImage}
    />

    {/* Featured Badge */}
    {article.featured && (
      <View style={styles.featuredBadge}>
        <Icon name="Star" size={16} color="#F59E0B" />
        <Text style={styles.featuredText}>Destacado</Text>
      </View>
    )}

    {/* Priority Badge */}
    {article.priority === 'URGENT' && (
      <View style={styles.urgentBadge}>
        <Icon name="AlertCircle" size={16} color="#fff" />
        <Text style={styles.urgentText}>Urgente</Text>
      </View>
    )}
  </View>

  {/* Article Content */}
  <View style={styles.articleContent}>
    <View style={styles.metaBadges}>
      <Badge label={article.category} variant="primary" size="small" />
      {article.priority && article.priority !== 'LOW' && (
        <Badge
          label={article.priority}
          variant={article.priority === 'URGENT' ? 'danger' : 'warning'}
          size="small"
        />
      )}
    </View>

    <Text style={styles.articleTitle} numberOfLines={2}>
      {article.title}
    </Text>

    <Text style={styles.articleSummary} numberOfLines={3}>
      {article.summary}
    </Text>

    {/* Author Info */}
    <View style={styles.authorInfo}>
      <View style={styles.authorIcon}>
        <Icon
          name={getAuthorTypeIcon(article.authorType)}
          size={16}
          color={getAuthorTypeColor(article.authorType)}
        />
      </View>
      <Text style={styles.authorName}>{article.authorName}</Text>
    </View>

    {/* Article Meta */}
    <View style={styles.articleMeta}>
      <View style={styles.metaItem}>
        <Icon name="Calendar" size={14} color="#6B7280" />
        <Text style={styles.metaText}>
          {formatRelativeTime(article.publishedAt || article.createdAt)}
        </Text>
      </View>
      <View style={styles.metaItem}>
        <Icon name="Eye" size={14} color="#6B7280" />
        <Text style={styles.metaText}>
          {article.viewCount.toLocaleString()}
        </Text>
      </View>
    </View>

    {/* Tags */}
    {article.tags.length > 0 && (
      <View style={styles.tagsContainer}>
        {article.tags.slice(0, 3).map(tag => (
          <Chip key={tag} label={tag} size="small" variant="secondary" />
        ))}
        {article.tags.length > 3 && (
          <Chip label={`+${article.tags.length - 3}`} size="small" variant="secondary" />
        )}
      </View>
    )}

    {/* Interactions */}
    <View style={styles.interactions}>
      <View style={styles.interactionItem}>
        <Icon name="Heart" size={16} color="#EF4444" />
        <Text style={styles.interactionText}>{article.likeCount}</Text>
      </View>
      <View style={styles.interactionItem}>
        <Icon name="MessageCircle" size={16} color="#3B82F6" />
        <Text style={styles.interactionText}>{article.commentCount}</Text>
      </View>
    </View>
  </View>
</TouchableOpacity>
```

**Helpers:**
```javascript
const getAuthorTypeIcon = (type) => {
  const icons = {
    INSTITUTION: 'BookOpen',
    COMPANY: 'Building',
    ADMIN: 'Shield'
  };
  return icons[type] || 'User';
};

const getAuthorTypeColor = (type) => {
  const colors = {
    INSTITUTION: '#3B82F6',
    COMPANY: '#10B981',
    ADMIN: '#8B5CF6'
  };
  return colors[type] || '#6B7280';
};
```

---

#### 3. News Detail Screen
**Componente:** `NewsDetailScreen`

```javascript
<ScrollView style={styles.newsDetail}>
  {/* Header Image */}
  {article.imageUrl && (
    <View style={styles.headerImage}>
      <Image
        source={{ uri: article.imageUrl }}
        style={styles.coverImage}
      />
      <LinearGradient
        colors={['transparent', 'rgba(0,0,0,0.8)']}
        style={styles.imageGradient}
      />
    </View>
  )}

  {/* Article Content */}
  <View style={styles.articleContainer}>
    {/* Category & Priority */}
    <View style={styles.badges}>
      <Badge label={article.category} variant="primary" />
      {article.featured && (
        <Badge label="Destacado" variant="warning" icon="Star" />
      )}
      {article.priority === 'URGENT' && (
        <Badge label="Urgente" variant="danger" icon="AlertCircle" />
      )}
    </View>

    {/* Title */}
    <Text style={styles.articleTitle}>{article.title}</Text>

    {/* Author & Date */}
    <View style={styles.articleMeta}>
      <View style={styles.authorSection}>
        <View style={styles.authorIcon}>
          <Icon
            name={getAuthorTypeIcon(article.authorType)}
            size={20}
            color={getAuthorTypeColor(article.authorType)}
          />
        </View>
        <View>
          <Text style={styles.authorName}>{article.authorName}</Text>
          <Text style={styles.authorRole}>
            {translateAuthorType(article.authorType)}
          </Text>
        </View>
      </View>

      <View style={styles.dateSection}>
        <Icon name="Calendar" size={16} color="#6B7280" />
        <Text style={styles.dateText}>
          {formatDate(article.publishedAt || article.createdAt)}
        </Text>
      </View>
    </View>

    {/* Stats */}
    <View style={styles.statsRow}>
      <View style={styles.statItem}>
        <Icon name="Eye" size={18} color="#6B7280" />
        <Text style={styles.statValue}>{article.viewCount.toLocaleString()}</Text>
      </View>
      <View style={styles.statItem}>
        <Icon name="Heart" size={18} color="#EF4444" />
        <Text style={styles.statValue}>{article.likeCount}</Text>
      </View>
      <View style={styles.statItem}>
        <Icon name="MessageCircle" size={18} color="#3B82F6" />
        <Text style={styles.statValue}>{article.commentCount}</Text>
      </View>
    </View>

    {/* Content */}
    <View style={styles.contentSection}>
      {article.videoUrl && (
        <VideoPlayer
          source={{ uri: article.videoUrl }}
          style={styles.videoPlayer}
        />
      )}

      <RichText content={article.content} style={styles.richText} />
    </View>

    {/* Tags */}
    {article.tags.length > 0 && (
      <View style={styles.tagsSection}>
        <Text style={styles.sectionTitle}>Etiquetas</Text>
        <View style={styles.tagsGrid}>
          {article.tags.map(tag => (
            <Chip key={tag} label={tag} variant="outline" />
          ))}
        </View>
      </View>
    )}

    {/* Actions */}
    <View style={styles.actionButtons}>
      <Button
        variant={hasLiked ? 'primary' : 'outline'}
        onPress={handleLike}
        style={styles.likeButton}
      >
        <Icon name={hasLiked ? 'Heart' : 'HeartOutline'} size={20} />
        <Text>Me gusta</Text>
      </Button>

      <Button
        variant="outline"
        onPress={handleShare}
        style={styles.shareButton}
      >
        <Icon name="Share" size={20} />
        <Text>Compartir</Text>
      </Button>
    </View>

    {/* Related News */}
    {relatedNews.length > 0 && (
      <View style={styles.relatedSection}>
        <Text style={styles.sectionTitle}>Noticias Relacionadas</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {relatedNews.map(relatedArticle => (
            <RelatedNewsCard
              key={relatedArticle.id}
              article={relatedArticle}
              onPress={() => handleViewNews(relatedArticle)}
            />
          ))}
        </ScrollView>
      </View>
    )}
  </View>
</ScrollView>
```

---

### 📊 Flujo de Noticias

```
1. User Opens News Screen
2. Fetch News: GET /api/news
3. Display News Grid/List with Categories
4. User Can:
   - Search news
   - Filter by category
   - View featured news
5. User Taps on News Card
6. Navigate to News Detail
7. Register View: POST /api/news/{id}/view
8. Increment viewCount
9. User Reads Article
10. User Can:
    - Like article: POST /api/news/{id}/like
    - Share article
    - View related articles
11. Show related news based on category/tags
```

---

## 🎯 Resumen de Implementación

### Tecnologías Recomendadas
```json
{
  "framework": "React Native with Expo",
  "navigation": "@react-navigation/native + @react-navigation/bottom-tabs",
  "stateManagement": "@reduxjs/toolkit or zustand",
  "networking": "axios",
  "storage": "@react-native-async-storage/async-storage",
  "ui": "react-native-elements or NativeBase",
  "forms": "react-hook-form",
  "icons": "lucide-react-native",
  "charts": "react-native-chart-kit",
  "pdf": "react-native-pdf",
  "video": "expo-av",
  "images": "expo-image-picker",
  "sharing": "expo-sharing"
}
```

### Estructura de Carpetas Recomendada
```
src/
├── screens/           # Todas las pantallas
│   ├── auth/
│   ├── dashboard/
│   ├── jobs/
│   ├── applications/
│   ├── institutions/
│   ├── profile/
│   ├── cv-builder/
│   ├── courses/
│   ├── certificates/
│   ├── resources/
│   ├── entrepreneurship/
│   └── news/
├── components/        # Componentes reutilizables
│   ├── cards/
│   ├── forms/
│   ├── navigation/
│   └── ui/
├── services/         # Servicios de API
│   ├── api.js
│   ├── auth.js
│   └── storage.js
├── hooks/            # Custom hooks
├── utils/            # Utilidades
├── types/            # TypeScript types
└── constants/        # Constantes
```

---

**FIN DE LA DOCUMENTACIÓN PARTE 3**

Este documento completa la especificación UX/UI de todas las secciones del usuario Youth de CEMSE.