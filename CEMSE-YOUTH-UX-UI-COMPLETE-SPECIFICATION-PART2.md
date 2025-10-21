# CEMSE YOUTH USER - Complete UX/UI Specification (PART 2)

## 📱 Continuación de la Guía Completa de UX/UI

**Este documento es la continuación de:** `CEMSE-YOUTH-UX-UI-COMPLETE-SPECIFICATION.md`

---

## 6. Constructor de CV (CV Builder)

### 📍 Ruta
```
Web: /cv-builder
Mobile: CVBuilderScreen
```

### 🔌 API Endpoints

```javascript
// 1. Obtener datos del perfil para CV
GET /api/profile/me

// 2. Guardar template de CV seleccionado
PATCH /api/profiles
Body: {
  cvTemplate: "professional" | "creative" | "minimal" | "academic"
}

// 3. Generar/Descargar CV (si existe endpoint específico)
POST /api/cv/generate
Body: {
  templateId: "string",
  sections: string[] // Secciones a incluir
}

Response: {
  success: true,
  cvUrl: "string", // URL del CV generado
  downloadUrl: "string"
}

// 4. Actualizar CV URL en perfil
PATCH /api/profiles
Body: {
  cvUrl: "string"
}
```

### 🎨 Componentes UI

#### 1. CV Builder Tabs
**Componente:** `CVBuilderTabs`

```javascript
<Tabs>
  <Tab label="Información Personal" icon="User">
    <ProfileInformationTab />
  </Tab>

  <Tab label="Plantillas de CV" icon="FileText">
    <CVTemplatesTab />
  </Tab>

  <Tab label="Cartas de Presentación" icon="Mail">
    <PresentationLettersTab />
  </Tab>
</Tabs>
```

---

#### 2. CV Templates Tab
**Componente:** `CVTemplatesTab`

```javascript
const cvTemplates = [
  {
    id: 'professional',
    name: 'Professional',
    description: 'Diseño clásico y elegante para cualquier industria',
    thumbnail: require('./templates/professional-thumb.png'),
    colors: ['#1E40AF', '#3B82F6'],
    features: ['Formato ATS-friendly', 'Diseño limpio', 'Fácil de leer'],
    bestFor: ['Corporativo', 'Formal', 'Tradicional']
  },
  {
    id: 'creative',
    name: 'Creative',
    description: 'Diseño moderno con colores vibrantes',
    thumbnail: require('./templates/creative-thumb.png'),
    colors: ['#8B5CF6', '#EC4899'],
    features: ['Diseño colorido', 'Moderno', 'Creativo'],
    bestFor: ['Diseño', 'Marketing', 'Startups']
  },
  {
    id: 'minimal',
    name: 'Minimal',
    description: 'Diseño minimalista y directo al punto',
    thumbnail: require('./templates/minimal-thumb.png'),
    colors: ['#000000', '#6B7280'],
    features: ['Simple', 'Minimalista', 'Profesional'],
    bestFor: ['Tech', 'Ingeniería', 'Consultoría']
  },
  {
    id: 'academic',
    name: 'Academic',
    description: 'Enfocado en educación e investigación',
    thumbnail: require('./templates/academic-thumb.png'),
    colors: ['#059669', '#10B981'],
    features: ['Académico', 'Detallado', 'Publicaciones'],
    bestFor: ['Academia', 'Investigación', 'Educación']
  }
];

<ScrollView style={styles.templatesContainer}>
  <View style={styles.header}>
    <Text style={styles.title}>Plantillas de CV</Text>
    <Text style={styles.subtitle}>
      Selecciona una plantilla profesional para tu currículum
    </Text>
  </View>

  <View style={styles.templatesGrid}>
    {cvTemplates.map(template => (
      <TemplateCard
        key={template.id}
        template={template}
        isSelected={selectedTemplate === template.id}
        onSelect={() => handleSelectTemplate(template.id)}
        onPreview={() => handlePreviewTemplate(template)}
      />
    ))}
  </View>

  {/* CV Sections Selector */}
  <Card style={styles.sectionsCard}>
    <Text style={styles.sectionTitle}>Secciones del CV</Text>
    <Text style={styles.sectionSubtitle}>
      Selecciona las secciones que deseas incluir en tu CV
    </Text>

    <View style={styles.sectionsList}>
      {cvSections.map(section => (
        <CheckboxItem
          key={section.id}
          label={section.label}
          description={section.description}
          checked={selectedSections.includes(section.id)}
          onChange={() => toggleSection(section.id)}
          icon={section.icon}
          required={section.required}
        />
      ))}
    </View>
  </Card>

  {/* Preview & Generate Actions */}
  <View style={styles.actions}>
    <Button
      variant="outline"
      onPress={handlePreviewCV}
      style={styles.actionButton}
    >
      <Icon name="Eye" size={20} />
      <Text>Vista Previa</Text>
    </Button>

    <Button
      onPress={handleGenerateCV}
      style={styles.actionButton}
    >
      <Icon name="Download" size={20} />
      <Text>Generar CV</Text>
    </Button>
  </View>
</ScrollView>
```

**CV Sections:**
```javascript
const cvSections = [
  {
    id: 'personalInfo',
    label: 'Información Personal',
    description: 'Nombre, contacto, ubicación',
    icon: 'User',
    required: true
  },
  {
    id: 'professionalSummary',
    label: 'Resumen Profesional',
    description: 'Breve descripción de tu perfil',
    icon: 'FileText',
    required: false
  },
  {
    id: 'workExperience',
    label: 'Experiencia Laboral',
    description: 'Historial de trabajo',
    icon: 'Briefcase',
    required: false
  },
  {
    id: 'education',
    label: 'Educación',
    description: 'Estudios y formación académica',
    icon: 'GraduationCap',
    required: true
  },
  {
    id: 'skills',
    label: 'Habilidades',
    description: 'Habilidades técnicas y soft skills',
    icon: 'Star',
    required: false
  },
  {
    id: 'languages',
    label: 'Idiomas',
    description: 'Idiomas que dominas',
    icon: 'Globe',
    required: false
  },
  {
    id: 'projects',
    label: 'Proyectos',
    description: 'Proyectos personales o profesionales',
    icon: 'Code',
    required: false
  },
  {
    id: 'references',
    label: 'Referencias',
    description: 'Referencias profesionales',
    icon: 'Users',
    required: false
  }
];
```

---

#### 3. Template Card
**Componente:** `TemplateCard`

```javascript
<TouchableOpacity
  style={[
    styles.templateCard,
    isSelected && styles.templateCardSelected
  ]}
  onPress={onSelect}
>
  {/* Template Thumbnail */}
  <View style={styles.thumbnailContainer}>
    <Image
      source={template.thumbnail}
      style={styles.thumbnail}
      resizeMode="cover"
    />
    {isSelected && (
      <View style={styles.selectedBadge}>
        <Icon name="Check" size={16} color="#fff" />
        <Text style={styles.selectedText}>Seleccionado</Text>
      </View>
    )}
  </View>

  {/* Template Info */}
  <View style={styles.templateInfo}>
    <Text style={styles.templateName}>{template.name}</Text>
    <Text style={styles.templateDescription} numberOfLines={2}>
      {template.description}
    </Text>

    {/* Color Palette */}
    <View style={styles.colorPalette}>
      {template.colors.map((color, index) => (
        <View
          key={index}
          style={[styles.colorDot, { backgroundColor: color }]}
        />
      ))}
    </View>

    {/* Features */}
    <View style={styles.features}>
      {template.features.slice(0, 3).map((feature, index) => (
        <Chip
          key={index}
          label={feature}
          size="small"
          variant="outline"
        />
      ))}
    </View>

    {/* Best For */}
    <View style={styles.bestFor}>
      <Text style={styles.bestForLabel}>Ideal para:</Text>
      <Text style={styles.bestForText}>
        {template.bestFor.join(', ')}
      </Text>
    </View>
  </View>

  {/* Actions */}
  <View style={styles.templateActions}>
    <TouchableOpacity
      style={styles.previewButton}
      onPress={(e) => {
        e.stopPropagation();
        onPreview();
      }}
    >
      <Icon name="Eye" size={16} />
      <Text style={styles.previewText}>Vista Previa</Text>
    </TouchableOpacity>

    <TouchableOpacity
      style={[
        styles.selectButton,
        isSelected && styles.selectButtonActive
      ]}
      onPress={onSelect}
    >
      <Icon
        name={isSelected ? 'Check' : 'Plus'}
        size={16}
        color={isSelected ? '#fff' : '#3B82F6'}
      />
      <Text style={[
        styles.selectText,
        isSelected && styles.selectTextActive
      ]}>
        {isSelected ? 'Seleccionado' : 'Seleccionar'}
      </Text>
    </TouchableOpacity>
  </View>
</TouchableOpacity>
```

---

#### 4. CV Preview Modal
**Componente:** `CVPreviewModal`

```javascript
<Modal
  visible={showPreview}
  animationType="slide"
  onRequestClose={() => setShowPreview(false)}
>
  <View style={styles.previewContainer}>
    {/* Header */}
    <View style={styles.previewHeader}>
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => setShowPreview(false)}
      >
        <Icon name="ArrowLeft" size={24} />
      </TouchableOpacity>
      <Text style={styles.previewTitle}>Vista Previa del CV</Text>
      <TouchableOpacity
        style={styles.downloadButton}
        onPress={handleDownloadCV}
      >
        <Icon name="Download" size={24} />
      </TouchableOpacity>
    </View>

    {/* CV Preview (WebView or PDF Viewer) */}
    <ScrollView
      style={styles.previewContent}
      contentContainerStyle={styles.previewContentContainer}
    >
      {/* Render CV based on selected template */}
      <CVRenderer
        template={selectedTemplate}
        data={profileData}
        sections={selectedSections}
      />
    </ScrollView>

    {/* Actions */}
    <View style={styles.previewActions}>
      <Button
        variant="outline"
        onPress={() => setShowPreview(false)}
        style={styles.actionButton}
      >
        Cerrar
      </Button>

      <Button
        onPress={handleShareCV}
        style={styles.actionButton}
      >
        <Icon name="Share" size={18} />
        Compartir
      </Button>

      <Button
        variant="success"
        onPress={handleDownloadCV}
        style={styles.actionButton}
      >
        <Icon name="Download" size={18} />
        Descargar PDF
      </Button>
    </View>
  </View>
</Modal>
```

---

#### 5. Presentation Letters Tab
**Componente:** `PresentationLettersTab`

```javascript
<ScrollView style={styles.lettersContainer}>
  <View style={styles.header}>
    <Text style={styles.title}>Cartas de Presentación</Text>
    <Text style={styles.subtitle}>
      Crea cartas personalizadas para tus postulaciones
    </Text>
  </View>

  {/* Saved Letters */}
  {savedLetters.length > 0 && (
    <Card style={styles.savedLettersCard}>
      <Text style={styles.cardTitle}>Mis Cartas Guardadas</Text>
      <FlatList
        data={savedLetters}
        renderItem={({ item }) => (
          <LetterListItem
            letter={item}
            onEdit={() => handleEditLetter(item)}
            onDelete={() => handleDeleteLetter(item.id)}
            onUse={() => handleUseLetter(item)}
          />
        )}
        keyExtractor={item => item.id}
      />
    </Card>
  )}

  {/* Create New Letter */}
  <Card style={styles.newLetterCard}>
    <Text style={styles.cardTitle}>Crear Nueva Carta</Text>

    <FormField>
      <Label>Título de la Carta</Label>
      <Input
        value={letterData.title}
        onChangeText={text => setLetterData({...letterData, title: text})}
        placeholder="Ej: Carta para Desarrollador Frontend"
      />
    </FormField>

    <FormField>
      <Label>Destinatario</Label>
      <Input
        value={letterData.recipient}
        onChangeText={text => setLetterData({...letterData, recipient: text})}
        placeholder="Nombre del destinatario"
      />
    </FormField>

    <FormField>
      <Label>Empresa/Organización</Label>
      <Input
        value={letterData.company}
        onChangeText={text => setLetterData({...letterData, company: text})}
        placeholder="Nombre de la empresa"
      />
    </FormField>

    <FormField>
      <Label>Puesto al que Aplicas</Label>
      <Input
        value={letterData.position}
        onChangeText={text => setLetterData({...letterData, position: text})}
        placeholder="Título del puesto"
      />
    </FormField>

    <FormField>
      <Label>Contenido de la Carta</Label>
      <TextArea
        value={letterData.content}
        onChangeText={text => setLetterData({...letterData, content: text})}
        placeholder="Escribe el contenido de tu carta..."
        rows={10}
        maxLength={1000}
      />
      <HelperText>{letterData.content.length}/1000</HelperText>
    </FormField>

    <FormField>
      <Label>Plantilla</Label>
      <Select
        value={letterData.template}
        onChange={value => setLetterData({...letterData, template: value})}
        options={[
          { value: 'professional', label: 'Profesional' },
          { value: 'creative', label: 'Creativa' },
          { value: 'formal', label: 'Formal' }
        ]}
      />
    </FormField>

    <View style={styles.letterActions}>
      <Button
        variant="outline"
        onPress={handleSaveLetter}
      >
        <Icon name="Save" size={18} />
        Guardar
      </Button>

      <Button
        onPress={handlePreviewLetter}
      >
        <Icon name="Eye" size={18} />
        Vista Previa
      </Button>
    </View>
  </Card>

  {/* Letter Templates */}
  <Card style={styles.templatesCard}>
    <Text style={styles.cardTitle}>Plantillas Sugeridas</Text>
    <View style={styles.templatesGrid}>
      {letterTemplates.map(template => (
        <LetterTemplateCard
          key={template.id}
          template={template}
          onSelect={() => handleSelectLetterTemplate(template)}
        />
      ))}
    </View>
  </Card>
</ScrollView>
```

---

### 📊 Flujo de Generación de CV

```
1. User Opens CV Builder
2. Fetch Profile Data: GET /api/profile/me
3. User Selects Template
4. User Selects Sections to Include
5. User Taps "Vista Previa"
6. Generate CV Preview (client-side rendering or server API call)
7. User Reviews CV
8. User Taps "Generar CV"
9. POST /api/cv/generate {
     templateId: selectedTemplate,
     sections: selectedSections
   }
10. Receive CV URL
11. Update Profile: PATCH /api/profiles { cvUrl: generatedCVUrl }
12. Show Success + Download Options
13. User can:
    - Download PDF
    - Share link
    - Use in applications
```

---

## 7. Cursos (Courses)

### 📍 Ruta
```
Web: /courses
Mobile: CoursesScreen (Tab Navigator)
```

### 🔌 API Endpoints

```javascript
// 1. Listar cursos
GET /api/courses?search={term}&level={level}&category={category}

Response: {
  success: true,
  courses: [
    {
      id: "string",
      title: "string",
      description: "string",
      summary: "string",
      imageUrl: "string",
      level: "BEGINNER" | "INTERMEDIATE" | "ADVANCED",
      duration: number, // en minutos
      studentsCount: number,
      rating: number, // 0-5
      status: "DRAFT" | "PUBLISHED" | "ARCHIVED",
      certification: boolean,
      prerequisites: string[],
      targetAudience: string[],
      language: "string",
      category: "string",
      tags: string[],
      price: number,
      currency: "string",
      isActive: boolean,
      publishedAt: "ISO string",
      instructor: {
        firstName: "string",
        lastName: "string",
        avatar: "string"
      },
      modules: Module[],
      _count: {
        enrollments: number
      }
    }
  ],
  pagination: {
    total: number,
    page: number,
    limit: number
  }
}

// 2. Detalle del curso
GET /api/courses/{id}

// 3. Inscribirse en curso
POST /api/courses/{id}/enroll

Response: {
  success: true,
  enrollment: {
    id: "string",
    courseId: "string",
    userId: "string",
    enrolledAt: "ISO string",
    progress: 0,
    status: "ACTIVE"
  }
}

// 4. Obtener progreso del curso
GET /api/courses/{id}/progress

Response: {
  success: true,
  enrollment: {
    courseId: "string",
    progress: number, // 0-100
    completedLessons: number,
    totalLessons: number,
    timeSpent: number, // en minutos
    lastAccessedAt: "ISO string",
    completedAt: "ISO string" | null
  }
}

// 5. Actualizar progreso de lección
PATCH /api/courses/{id}/progress
Body: {
  lessonId: "string",
  isCompleted: boolean,
  timeSpent: number
}

// 6. Obtener módulos del curso
GET /api/courses/{id}/modules

// 7. Obtener lecciones del curso
GET /api/courses/{id}/lessons

// 8. Obtener quizzes del curso
GET /api/courses/{id}/quizzes

// 9. Obtener quiz específico
GET /api/courses/{id}/quizzes/{quizId}

// 10. Enviar respuestas de quiz
POST /api/courses/{id}/quizzes/{quizId}/submit
Body: {
  answers: [
    {
      questionId: "string",
      answerId: "string" | string[] // single or multiple choice
    }
  ]
}

Response: {
  success: true,
  result: {
    score: number, // 0-100
    passed: boolean,
    correctAnswers: number,
    totalQuestions: number,
    feedback: string
  }
}
```

### 🎨 Componentes UI

#### 1. Courses Header with Search
**Componente:** `CoursesHeader`

```javascript
<View style={styles.coursesHeader}>
  <Text style={styles.title}>Cursos</Text>
  <Text style={styles.subtitle}>
    Aprende nuevas habilidades y obtén certificados
  </Text>

  <View style={styles.searchBar}>
    <Icon name="Search" size={20} color="#9CA3AF" />
    <TextInput
      placeholder="Buscar cursos..."
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
  <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filters}>
    <FilterChip
      label="Todos"
      active={activeFilter === 'all'}
      onPress={() => setActiveFilter('all')}
    />
    <FilterChip
      label="Inscritos"
      active={activeFilter === 'enrolled'}
      onPress={() => setActiveFilter('enrolled')}
      count={enrolledCourses.length}
    />
    <FilterChip
      label="Principiante"
      active={activeFilter === 'beginner'}
      onPress={() => setActiveFilter('beginner')}
    />
    <FilterChip
      label="Intermedio"
      active={activeFilter === 'intermediate'}
      onPress={() => setActiveFilter('intermediate')}
    />
    <FilterChip
      label="Avanzado"
      active={activeFilter === 'advanced'}
      onPress={() => setActiveFilter('advanced')}
    />
  </ScrollView>
</View>
```

---

#### 2. Course Card
**Componente:** `CourseCard`

```javascript
<TouchableOpacity
  style={styles.courseCard}
  onPress={() => navigation.navigate('CourseDetail', { courseId: course.id })}
>
  {/* Course Image */}
  <View style={styles.imageContainer}>
    <Image
      source={{ uri: course.imageUrl }}
      style={styles.courseImage}
      defaultSource={require('./assets/course-placeholder.png')}
    />

    {/* Level Badge */}
    <View style={[styles.levelBadge, getLevelStyle(course.level)]}>
      <Text style={styles.levelText}>{translateLevel(course.level)}</Text>
    </View>

    {/* Enrollment Badge (if enrolled) */}
    {isEnrolled(course.id) && (
      <View style={styles.enrolledBadge}>
        <Icon name="CheckCircle" size={16} color="#fff" />
        <Text style={styles.enrolledText}>Inscrito</Text>
      </View>
    )}
  </View>

  {/* Course Info */}
  <View style={styles.courseInfo}>
    <Text style={styles.courseTitle} numberOfLines={2}>
      {course.title}
    </Text>

    <Text style={styles.courseSummary} numberOfLines={2}>
      {course.summary}
    </Text>

    {/* Instructor */}
    <View style={styles.instructor}>
      <Avatar
        size="small"
        source={course.instructor.avatar}
        fallback={getInitials(course.instructor.firstName, course.instructor.lastName)}
      />
      <Text style={styles.instructorName}>
        {course.instructor.firstName} {course.instructor.lastName}
      </Text>
    </View>

    {/* Course Meta */}
    <View style={styles.courseMeta}>
      <MetaItem icon="Clock" value={`${formatDuration(course.duration)}`} />
      <MetaItem icon="Users" value={`${course.studentsCount} estudiantes`} />
      {course.rating && (
        <MetaItem icon="Star" value={course.rating.toFixed(1)} />
      )}
    </View>

    {/* Progress Bar (if enrolled) */}
    {isEnrolled(course.id) && (
      <View style={styles.progressContainer}>
        <View style={styles.progressHeader}>
          <Text style={styles.progressLabel}>Progreso</Text>
          <Text style={styles.progressPercent}>
            {getProgress(course.id)}%
          </Text>
        </View>
        <ProgressBar
          progress={getProgress(course.id) / 100}
          color="#10B981"
        />
      </View>
    )}

    {/* Actions */}
    <View style={styles.cardActions}>
      {isEnrolled(course.id) ? (
        <Button
          size="small"
          onPress={() => navigation.navigate('CourseLearn', { courseId: course.id })}
        >
          <Icon name="PlayCircle" size={16} />
          <Text>Continuar</Text>
        </Button>
      ) : (
        <>
          <Button
            variant="outline"
            size="small"
            onPress={() => navigation.navigate('CourseDetail', { courseId: course.id })}
          >
            <Icon name="Eye" size={16} />
            <Text>Ver Más</Text>
          </Button>
          <Button
            size="small"
            onPress={() => handleEnrollCourse(course.id)}
          >
            <Icon name="Plus" size={16} />
            <Text>Inscribirse</Text>
          </Button>
        </>
      )}
    </View>
  </View>
</TouchableOpacity>
```

**Helpers:**
```javascript
const getLevelStyle = (level) => {
  const styles = {
    BEGINNER: { backgroundColor: '#10B981' },
    INTERMEDIATE: { backgroundColor: '#F59E0B' },
    ADVANCED: { backgroundColor: '#EF4444' }
  };
  return styles[level] || { backgroundColor: '#6B7280' };
};

const translateLevel = (level) => {
  const translations = {
    BEGINNER: 'Principiante',
    INTERMEDIATE: 'Intermedio',
    ADVANCED: 'Avanzado'
  };
  return translations[level] || level;
};

const formatDuration = (minutes) => {
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
};
```

---

#### 3. Course Detail Screen
**Componente:** `CourseDetailScreen`

```javascript
<ScrollView style={styles.courseDetail}>
  {/* Header */}
  <View style={styles.detailHeader}>
    <Image
      source={{ uri: course.imageUrl }}
      style={styles.headerImage}
    />
    <LinearGradient
      colors={['transparent', 'rgba(0,0,0,0.8)']}
      style={styles.headerGradient}
    >
      <View style={styles.headerContent}>
        <Text style={styles.headerTitle}>{course.title}</Text>
        <View style={styles.headerMeta}>
          <Badge label={translateLevel(course.level)} />
          <MetaItem icon="Clock" value={formatDuration(course.duration)} color="#fff" />
          <MetaItem icon="Users" value={`${course.studentsCount} estudiantes`} color="#fff" />
        </View>
      </View>
    </LinearGradient>
  </View>

  {/* Quick Stats */}
  <View style={styles.quickStats}>
    <StatItem icon="Star" value={course.rating?.toFixed(1) || 'N/A'} label="Calificación" />
    <StatItem icon="BookOpen" value={course.modules?.length || 0} label="Módulos" />
    <StatItem icon="FileText" value={course.lessons?.length || 0} label="Lecciones" />
    {course.certification && (
      <StatItem icon="Award" value="Sí" label="Certificado" />
    )}
  </View>

  {/* Tabs */}
  <Tabs>
    <Tab label="Descripción">
      <View style={styles.tabContent}>
        <SectionTitle>Sobre el Curso</SectionTitle>
        <Text style={styles.description}>{course.description}</Text>

        {course.prerequisites.length > 0 && (
          <>
            <SectionTitle>Requisitos Previos</SectionTitle>
            <BulletList items={course.prerequisites} />
          </>
        )}

        {course.targetAudience.length > 0 && (
          <>
            <SectionTitle>¿Para Quién es Este Curso?</SectionTitle>
            <BulletList items={course.targetAudience} />
          </>
        )}

        {course.tags.length > 0 && (
          <>
            <SectionTitle>Temas</SectionTitle>
            <View style={styles.tagsContainer}>
              {course.tags.map(tag => (
                <Chip key={tag} label={tag} size="small" />
              ))}
            </View>
          </>
        )}
      </View>
    </Tab>

    <Tab label={`Contenido (${course.modules?.length || 0})`}>
      <CourseContentTab course={course} />
    </Tab>

    <Tab label="Instructor">
      <InstructorTab instructor={course.instructor} />
    </Tab>

    <Tab label="Reseñas">
      <ReviewsTab courseId={course.id} />
    </Tab>
  </Tabs>

  {/* Enrollment CTA */}
  {!isEnrolled && (
    <View style={styles.enrollmentCTA}>
      <View style={styles.ctaContent}>
        <Text style={styles.ctaTitle}>¿Listo para empezar?</Text>
        <Text style={styles.ctaSubtitle}>
          Inscríbete ahora y comienza a aprender
        </Text>
      </View>
      <Button
        style={styles.enrollButton}
        onPress={() => handleEnrollCourse(course.id)}
      >
        <Icon name="Plus" size={20} />
        <Text>Inscribirse al Curso</Text>
      </Button>
    </View>
  )}

  {/* Continue Learning (if enrolled) */}
  {isEnrolled && (
    <View style={styles.continueLearning}>
      <View style={styles.progressInfo}>
        <Text style={styles.progressTitle}>Tu Progreso</Text>
        <Text style={styles.progressPercent}>{progress}%</Text>
      </View>
      <ProgressBar progress={progress / 100} color="#10B981" />
      <Button
        style={styles.continueButton}
        onPress={() => navigation.navigate('CourseLearn', { courseId: course.id })}
      >
        <Icon name="PlayCircle" size={20} />
        <Text>Continuar Aprendiendo</Text>
      </Button>
    </View>
  )}
</ScrollView>
```

---

#### 4. Course Content Tab (Módulos y Lecciones)
**Componente:** `CourseContentTab`

```javascript
<View style={styles.contentTab}>
  {course.modules.map((module, moduleIndex) => (
    <ModuleAccordion
      key={module.id}
      module={module}
      moduleIndex={moduleIndex}
      isEnrolled={isEnrolled}
      onLessonPress={handleLessonPress}
    />
  ))}
</View>

// Module Accordion Component
const ModuleAccordion = ({ module, moduleIndex, isEnrolled, onLessonPress }) => {
  const [expanded, setExpanded] = useState(moduleIndex === 0);

  return (
    <View style={styles.moduleAccordion}>
      <TouchableOpacity
        style={styles.moduleHeader}
        onPress={() => setExpanded(!expanded)}
      >
        <View style={styles.moduleInfo}>
          <Text style={styles.moduleNumber}>Módulo {moduleIndex + 1}</Text>
          <Text style={styles.moduleTitle}>{module.title}</Text>
          <Text style={styles.moduleMeta}>
            {module.lessons.length} lecciones • {formatDuration(module.duration)}
          </Text>
        </View>
        <Icon
          name={expanded ? 'ChevronUp' : 'ChevronDown'}
          size={20}
        />
      </TouchableOpacity>

      {expanded && (
        <View style={styles.moduleContent}>
          {module.lessons.map((lesson, lessonIndex) => (
            <LessonItem
              key={lesson.id}
              lesson={lesson}
              lessonIndex={lessonIndex}
              isLocked={!isEnrolled}
              onPress={() => onLessonPress(lesson)}
            />
          ))}
        </View>
      )}
    </View>
  );
};

// Lesson Item Component
const LessonItem = ({ lesson, lessonIndex, isLocked, onPress }) => (
  <TouchableOpacity
    style={[styles.lessonItem, isLocked && styles.lessonItemLocked]}
    onPress={!isLocked ? onPress : undefined}
    disabled={isLocked}
  >
    <View style={styles.lessonIcon}>
      {isLocked ? (
        <Icon name="Lock" size={20} color="#9CA3AF" />
      ) : (
        <>
          {lesson.type === 'video' && <Icon name="PlayCircle" size={20} color="#3B82F6" />}
          {lesson.type === 'reading' && <Icon name="FileText" size={20} color="#10B981" />}
          {lesson.type === 'quiz' && <Icon name="HelpCircle" size={20} color="#F59E0B" />}
        </>
      )}
    </View>

    <View style={styles.lessonInfo}>
      <Text style={[styles.lessonTitle, isLocked && styles.lessonTitleLocked]}>
        {lessonIndex + 1}. {lesson.title}
      </Text>
      <View style={styles.lessonMeta}>
        <Text style={styles.lessonDuration}>{formatDuration(lesson.duration)}</Text>
        {lesson.isCompleted && (
          <>
            <Text style={styles.metaSeparator}>•</Text>
            <Icon name="CheckCircle" size={14} color="#10B981" />
            <Text style={styles.completedText}>Completado</Text>
          </>
        )}
      </View>
    </View>

    {!isLocked && (
      <Icon name="ChevronRight" size={20} color="#9CA3AF" />
    )}
  </TouchableOpacity>
);
```

---

#### 5. Course Learning Screen
**Componente:** `CourseLearningScreen`

```javascript
<View style={styles.learningScreen}>
  {/* Top Progress Bar */}
  <View style={styles.topBar}>
    <TouchableOpacity
      style={styles.backButton}
      onPress={handleBack}
    >
      <Icon name="ArrowLeft" size={24} />
    </TouchableOpacity>
    <View style={styles.progressInfo}>
      <Text style={styles.progressText}>
        Lección {currentLessonIndex + 1} de {totalLessons}
      </Text>
      <ProgressBar
        progress={(currentLessonIndex + 1) / totalLessons}
        color="#10B981"
        style={styles.topProgress}
      />
    </View>
    <TouchableOpacity
      style={styles.menuButton}
      onPress={() => setShowMenu(true)}
    >
      <Icon name="MoreVertical" size={24} />
    </TouchableOpacity>
  </View>

  {/* Lesson Content */}
  <ScrollView style={styles.lessonContent}>
    {currentLesson.type === 'video' && (
      <VideoPlayer
        source={{ uri: currentLesson.videoUrl }}
        style={styles.videoPlayer}
        onProgress={handleVideoProgress}
        onEnd={handleVideoEnd}
      />
    )}

    {currentLesson.type === 'reading' && (
      <View style={styles.readingContent}>
        <Text style={styles.lessonTitle}>{currentLesson.title}</Text>
        <RichText content={currentLesson.content} />
      </View>
    )}

    {currentLesson.type === 'quiz' && (
      <QuizComponent
        quiz={currentLesson.quiz}
        onSubmit={handleQuizSubmit}
      />
    )}
  </ScrollView>

  {/* Navigation Controls */}
  <View style={styles.navigationControls}>
    <Button
      variant="outline"
      disabled={currentLessonIndex === 0}
      onPress={handlePreviousLesson}
    >
      <Icon name="ChevronLeft" size={20} />
      <Text>Anterior</Text>
    </Button>

    {currentLesson.isCompleted ? (
      <Button
        disabled={currentLessonIndex === totalLessons - 1}
        onPress={handleNextLesson}
      >
        <Text>Siguiente</Text>
        <Icon name="ChevronRight" size={20} />
      </Button>
    ) : (
      <Button
        onPress={handleMarkComplete}
      >
        <Icon name="CheckCircle" size={20} />
        <Text>Marcar como Completada</Text>
      </Button>
    )}
  </View>
</View>
```

---

### 📊 Flujo de Inscripción y Aprendizaje

```
1. User Browses Courses
2. User Selects Course
3. Course Detail Screen Shows:
   - Course info
   - Modules/Lessons
   - Requirements
4. User Taps "Inscribirse"
5. POST /api/courses/{id}/enroll
6. On Success:
   - Show success message
   - Update local state (isEnrolled = true)
   - Show "Continuar Aprendiendo" button
7. User Taps "Continuar Aprendiendo"
8. Fetch Progress: GET /api/courses/{id}/progress
9. Navigate to last accessed lesson or first incomplete lesson
10. User Watches/Reads Lesson
11. User Marks Lesson Complete
12. PATCH /api/courses/{id}/progress {
      lessonId: lessonId,
      isCompleted: true,
      timeSpent: timeSpent
    }
13. Update progress bar
14. If all lessons completed:
    - Show completion modal
    - Offer certificate generation
    - Navigate to certificates screen
```

---

**[Documento continúa con secciones 8-11: Certificados, Recursos, Hub de Emprendimiento y Noticias...]**

*Este documento continúa con el mismo nivel de detalle para las secciones restantes.*