# ANÁLISIS COMPLETO - MÓDULO ENTREPRENEURSHIP HUB (ROL YOUTH) - CEMSE

## 1. ESTRUCTURA DE ARCHIVOS Y COMPONENTES

### 1.1 Páginas (`src/app/(dashboard)/entrepreneurship/`)

| Archivo | Ruta | Propósito |
|---------|------|-----------|
| `page.tsx` | `/entrepreneurship` | **Dashboard principal** del hub de emprendimiento. Muestra resumen, noticias, recursos y proyectos del usuario |
| `calculator/page.tsx` | `/entrepreneurship/calculator` | Página de calculadora financiera |
| `analytics/page.tsx` | `/entrepreneurship/analytics` | Análisis y métricas de emprendimientos |
| `connections/page.tsx` | `/entrepreneurship/connections` | Gestión de conexiones con otros emprendedores |
| `network/page.tsx` | `/entrepreneurship/network` | Red de emprendedores para networking |

### 1.2 Componentes (`src/components/entrepreneurship/`)

#### **Business Plan Components**

| Componente | Propósito | Dependencias Principales |
|------------|-----------|--------------------------|
| `BusinessPlanBuilder.tsx` | Constructor paso a paso de planes de negocio | `useBusinessPlans`, `businessPlanService`, `businessPlanTemplates` |
| `BusinessPlanPDF.tsx` | Exportación de planes de negocio a PDF | `BusinessPlanData`, PDF libs |
| `BusinessModelCanvas.tsx` | Canvas visual del modelo de negocio | `BusinessPlanData` |
| `BusinessModelCanvasModal.tsx` | Modal para editar el Business Model Canvas | `BusinessModelCanvas` |
| `BusinessModelCanvasPDF.tsx` | Exportación del Canvas a PDF | Canvas data |

**Props y Estado:**
- `BusinessPlanBuilder`: Recibe `businessPlanId?` (opcional), `onSave(plan)` callback
- Gestiona estado interno del plan, sección actual, validación, progreso

#### **Financial Components**

| Componente | Propósito | Dependencias |
|------------|-----------|--------------|
| `FinancialCalculator.tsx` | Calculadora de métricas financieras | `financialCalculatorService` |
| `FinancialCalculatorForm.tsx` | Formulario de entrada de datos financieros | State management |
| `FinancialCharts.tsx` | Gráficos de proyecciones financieras | Chart.js/Recharts |

**Props:**
- `FinancialCalculator`: `financialData`, `onUpdate(data)`

#### **Network & Social Components**

| Componente | Propósito | Dependencias |
|------------|-----------|--------------|
| `ConnectionCard.tsx` | Tarjeta de conexión con emprendedor | `EntrepreneurshipConnection` |
| `ConnectionActions.tsx` | Acciones (aceptar/rechazar/cancelar) | `useEntrepreneurshipConnections` |
| `ConnectionRequestModal.tsx` | Modal para enviar solicitud de conexión | Connection state |
| `ConnectionStatusBadge.tsx` | Badge de estado de conexión | Status enum |
| `ConnectionNotifications.tsx` | Notificaciones de conexiones | Real-time updates |
| `UserCard.tsx` | Tarjeta de usuario emprendedor | User data |

#### **Posts & Feed Components**

| Componente | Propósito | Dependencias |
|------------|-----------|--------------|
| `PostCard.tsx` | Tarjeta de publicación en feed | `EntrepreneurshipPost` |
| `EnhancedPostCard.tsx` | Versión mejorada con más interactividad | Post interactions |
| `CreatePostForm.tsx` | Formulario para crear publicaciones | `useEntrepreneurshipPosts` |
| `PostInteractions.tsx` | Likes, comments, shares | Post engagement hooks |
| `PostShareModal.tsx` | Modal para compartir posts | Share functionality |
| `PostAnalytics.tsx` | Métricas de engagement | Analytics data |

#### **Content & Resources Components**

| Componente | Propósito | Dependencias |
|------------|-----------|--------------|
| `NewsCard.tsx` | Tarjeta de noticia de emprendimiento | `EntrepreneurshipNews` |
| `ResourceCard.tsx` | Tarjeta de recurso educativo | `EntrepreneurshipResource` |

#### **Entrepreneurship Management**

| Componente | Propósito | Dependencias |
|------------|-----------|--------------|
| `CreateEntrepreneurshipModal.tsx` | Modal para crear nuevo emprendimiento | `useEntrepreneurships` |
| `EntrepreneurshipGrid.tsx` | Grid de emprendimientos públicos | Filtros |
| `MyEntrepreneurshipsGrid.tsx` | Grid de emprendimientos del usuario | User entrepreneurships |
| `EntrepreneurshipDetailsModal.tsx` | Detalles de emprendimiento | Full data |
| `EntrepreneurshipFilters.tsx` | Filtros de búsqueda | Filter state |

#### **Special Components**

| Componente | Propósito |
|------------|-----------|
| `TripleImpactAnalysis.tsx` | Análisis de triple impacto (social/económico/ambiental) |
| `PDFExportButton.tsx` | Botón para exportar a PDF |
| `ChatSidebar.tsx` | Chat lateral para comunicación |
| `TestCanvas.tsx` | Componente de prueba para canvas |

### 1.3 API Endpoints (`src/app/api/`)

#### **Business Plans Endpoints**

| Endpoint | Método | Parámetros | Body | Respuesta |
|----------|--------|------------|------|-----------|
| `/api/business-plans` | GET | `limit`, `offset`, `status`, `sortBy`, `sortOrder` | - | `{ businessPlans: BusinessPlanData[], total, hasMore }` |
| `/api/business-plans` | POST | - | `BusinessPlanData` | `{ businessPlan: BusinessPlanData }` |
| `/api/business-plans/[id]` | GET | `id` (path) | - | `{ businessPlan: BusinessPlanData }` |
| `/api/business-plans/[id]` | PUT | `id` (path) | `Partial<BusinessPlanData>` | `{ businessPlan: BusinessPlanData }` |
| `/api/business-plans/[id]` | DELETE | `id` (path) | - | `{ success: true }` |

**Autenticación:** Requiere sesión activa (`NextAuth`)
**Seguridad:** Solo el dueño del plan puede ver/editar/eliminar

#### **Entrepreneurship Connections Endpoints**

| Endpoint | Método | Query Params | Body | Respuesta |
|----------|--------|--------------|------|-----------|
| `/api/entrepreneurship/connections` | GET | `type` (all/sent/received), `status` (PENDING/ACCEPTED/DECLINED), `page`, `limit` | - | `{ connections: EntrepreneurshipConnection[], pagination }` |
| `/api/entrepreneurship/connections` | POST | - | `{ addresseeId, message? }` | `{ success: true, connection }` |
| `/api/entrepreneurship/connections/[id]` | PUT | - | `{ status }` | `{ connection }` |
| `/api/entrepreneurship/connections/[id]` | DELETE | - | - | `{ success: true }` |

**Lógica de Negocio:**
- No se puede enviar solicitud a uno mismo
- No se puede duplicar solicitudes
- Ambos usuarios deben tener perfil completo
- Estados: `PENDING` → `ACCEPTED` / `DECLINED`

#### **Entrepreneurship Posts Endpoints**

| Endpoint | Método | Query Params | Body | Respuesta |
|----------|--------|--------------|------|-----------|
| `/api/entrepreneurship/posts` | GET | `page`, `limit`, `type` (TEXT/IMAGE/VIDEO/LINK/POLL/EVENT), `search`, `authorId` | - | `{ posts, pagination }` |
| `/api/entrepreneurship/posts` | POST | - | `{ content, type?, images?, tags? }` | `Post` |
| `/api/entrepreneurship/posts/[id]` | GET | - | - | `Post` |
| `/api/entrepreneurship/posts/[id]` | PUT | - | `Partial<Post>` | `Post` |
| `/api/entrepreneurship/posts/[id]` | DELETE | - | - | `{ success }` |
| `/api/entrepreneurship/posts/[id]/like` | POST | - | - | `{ liked }` |
| `/api/entrepreneurship/posts/[id]/share` | POST | - | - | `{ shared }` |
| `/api/entrepreneurship/posts/[id]/comments` | GET | `page`, `limit` | - | `{ comments, pagination }` |
| `/api/entrepreneurship/posts/[id]/comments` | POST | - | `{ content, parentId? }` | `Comment` |

#### **Entrepreneurship News Endpoints**

| Endpoint | Método | Query Params | Respuesta |
|----------|--------|--------------|-----------|
| `/api/entrepreneurship/news` | GET | `page`, `limit`, `category`, `search`, `published` | `{ news, pagination }` |
| `/api/entrepreneurship/news` | POST | - (Body: `CreateNewsData`) | `News` |

#### **Entrepreneurship Resources Endpoints**

| Endpoint | Método | Query Params | Respuesta |
|----------|--------|--------------|-----------|
| `/api/entrepreneurship/resources` | GET | `page`, `limit`, `type`, `category`, `search`, `featured` | `{ resources, pagination }` |
| `/api/entrepreneurship/resources` | POST | - (Body: `CreateResourceData`) | `Resource` |

**Resource Types:** `GUIDE`, `TEMPLATE`, `VIDEO`, `ARTICLE`, `TOOL`, etc.

#### **Entrepreneurship Users Endpoint**

| Endpoint | Método | Query Params | Respuesta |
|----------|--------|--------------|-----------|
| `/api/entrepreneurship/users` | GET | `page`, `limit`, `search`, `excludeConnected` | `{ users, pagination }` |

**Uso:** Búsqueda de emprendedores para networking

#### **Entrepreneurships Management**

| Endpoint | Método | Path/Query | Respuesta |
|----------|--------|------------|-----------|
| `/api/entrepreneurship/entrepreneurships` | GET | `page`, `limit`, filters | `{ entrepreneurships, pagination }` |
| `/api/entrepreneurship/entrepreneurships` | POST | - | `Entrepreneurship` |
| `/api/entrepreneurship/entrepreneurships/[id]` | GET/PUT/DELETE | - | Entrepreneurship data |
| `/api/entrepreneurship/my-entrepreneurships` | GET | - | User's entrepreneurships |

---

## 2. MODELOS DE DATOS (TypeScript Interfaces)

### 2.1 BusinessPlanData (Principal)

```typescript
interface BusinessPlanData {
  // Basic Info
  id?: string;
  userId: string;
  title: string;
  description: string;
  industry: string;
  stage: 'idea' | 'startup' | 'growth' | 'mature';

  // Financial Goals
  fundingGoal: number;
  currentFunding: number;
  teamSize: number;
  marketSize: number;

  // Core Business Model
  targetMarket: string;
  problemStatement: string;
  solution: string;
  valueProposition: string;
  businessModel: string;
  revenueStreams: string[];
  costStructure: string[];
  keyMetrics: string[];
  competitiveAdvantage: string;
  marketingStrategy: string;
  operationsPlan: string;

  // Triple Impact Assessment
  tripleImpactAssessment: {
    problemSolved: string;
    beneficiaries: string;
    resourcesUsed: string;
    communityInvolvement: string;
    longTermImpact: string;
  };

  // Business Model Canvas
  businessModelCanvas: {
    keyPartners: string;
    keyActivities: string;
    valuePropositions: string;
    customerRelationships: string;
    customerSegments: string;
    keyResources: string;
    channels: string;
    costStructure: string;
    revenueStreams: string;
  };

  // Enhanced Financial Projections
  financialProjections: {
    startupCosts: number;
    monthlyRevenue: number;
    monthlyExpenses: number;
    breakEvenMonth: number;
    revenueStreams: string[];

    // New financial calculator fields
    initialInvestment: number;
    monthlyOperatingCosts: number;
    revenueProjection: number;
    breakEvenPoint: number;
    estimatedROI: number;

    // Yearly projections
    year1?: FinancialProjection;
    year2?: FinancialProjection;
    year3?: FinancialProjection;
  };

  // Detailed Sections
  executiveSummary: string;
  businessDescription: string;
  marketAnalysis: string;
  competitiveAnalysis: string;
  operationalPlan: string;
  managementTeam: string;
  riskAnalysis: string;
  appendices: string;

  // Team & Milestones
  team: TeamMember[];
  milestones: Milestone[];
  risks: Risk[];

  // Metadata
  createdAt?: Date;
  updatedAt?: Date;
  completionPercentage?: number;
}

interface FinancialProjection {
  revenue: number;
  expenses: number;
  profit: number;
  cashFlow: number;
  customers: number;
  growthRate: number;
}

interface TeamMember {
  name: string;
  role: string;
  experience: string;
  skills: string[];
  equity: number;
  isFounder: boolean;
}

interface Milestone {
  id: string;
  title: string;
  description: string;
  targetDate: Date;
  status: 'pending' | 'in_progress' | 'completed' | 'delayed';
  priority: 'low' | 'medium' | 'high';
  dependencies: string[];
}

interface Risk {
  id: string;
  title: string;
  description: string;
  probability: 'low' | 'medium' | 'high';
  impact: 'low' | 'medium' | 'high';
  mitigation: string;
  owner: string;
}
```

### 2.2 EntrepreneurshipConnection

```typescript
interface EntrepreneurshipConnection {
  id: string;
  requesterId: string;      // User ID del solicitante
  addresseeId: string;       // User ID del destinatario
  status: 'PENDING' | 'ACCEPTED' | 'DECLINED';
  message?: string;          // Mensaje opcional al enviar solicitud
  requestedAt: string;
  acceptedAt?: string;

  requester: {
    id: string;
    name: string;
    email: string;
    image?: string;
  };

  addressee: {
    id: string;
    name: string;
    email: string;
    image?: string;
  };

  createdAt: string;
  updatedAt: string;
}
```

### 2.3 EntrepreneurshipPost

```typescript
type PostType = "TEXT" | "IMAGE" | "VIDEO" | "LINK" | "POLL" | "EVENT";

interface EntrepreneurshipPost {
  id: string;
  content: string;
  type: PostType;
  images: string[];
  tags: string[];

  // Engagement metrics
  likes: number;
  comments: number;
  shares: number;
  views?: number;
  isPinned: boolean;

  authorId: string;
  author: {
    id: string;
    firstName: string;
    lastName: string;
    avatarUrl?: string;
  };

  postLikes: {
    id: string;
    userId: string;
  }[];

  postComments: PostComment[];

  createdAt: string;
  updatedAt: string;
}

interface PostComment {
  id: string;
  content: string;
  postId: string;
  authorId: string;
  parentId?: string;        // Para respuestas a comentarios
  likes: number;

  author: {
    id: string;
    firstName: string;
    lastName: string;
    avatarUrl?: string;
  };

  replies: PostComment[];   // Comentarios anidados
  createdAt: string;
  updatedAt: string;
}
```

### 2.4 EntrepreneurshipNews

```typescript
interface EntrepreneurshipNews {
  id: string;
  title: string;
  summary: string;
  content: string;
  imageUrl?: string;
  sourceUrl?: string;
  sourceName?: string;
  category: string;
  tags: string[];
  isPublished: boolean;
  publishedAt?: string;
  views: number;
  likes: number;

  authorId: string;
  author: {
    id: string;
    name: string;
    email: string;
    image?: string;
  };

  createdAt: string;
  updatedAt: string;
}
```

### 2.5 EntrepreneurshipResource

```typescript
type ResourceType =
  | "GUIDE"
  | "TEMPLATE"
  | "VIDEO"
  | "ARTICLE"
  | "TOOL"
  | "EBOOK"
  | "COURSE"
  | "WEBINAR";

interface EntrepreneurshipResource {
  id: string;
  title: string;
  description: string;
  content: string;
  type: ResourceType;
  category: string;
  tags: string[];
  url?: string;             // URL externa
  fileUrl?: string;         // Archivo descargable
  imageUrl?: string;        // Imagen de portada
  isPublic: boolean;
  isFeatured: boolean;
  views: number;
  likes: number;

  authorId: string;
  author: {
    id: string;
    name: string;
    email: string;
    image?: string;
  };

  createdAt: string;
  updatedAt: string;
}
```

### 2.6 Financial Calculator Interfaces

```typescript
interface StartupFinancials {
  businessName: string;
  currency: string;

  // Revenue
  monthlyRevenue: number;
  revenueGrowthRate: number;
  revenueProjectionMonths: number;

  // Fixed Costs
  rent: number;
  salaries: number;
  insurance: number;
  utilities: number;
  marketing: number;
  otherFixedCosts: number;

  // Variable Costs
  costOfGoodsSold: number;
  variableCosts: number;

  // One-time Costs
  equipment: number;
  initialInventory: number;
  legalFees: number;
  otherOneTimeCosts: number;

  // Investment
  initialInvestment: number;
  additionalInvestment: number;
  investmentMonths: number;

  // Targets
  targetMonthlyProfit: number;
  targetRevenue: number;
}

interface FinancialProjection {
  month: number;
  revenue: number;
  expenses: number;
  profit: number;
  cumulativeProfit: number;
  cashFlow: number;
  cumulativeCashFlow: number;
}

interface BreakEvenAnalysis {
  breakEvenPoint: number;
  breakEvenRevenue: number;
  monthsToBreakEven: number;
  isAchievable: boolean;
  recommendations: string[];
}

interface InvestmentAnalysis {
  totalInvestment: number;
  monthlyBurnRate: number;
  runway: number;
  returnOnInvestment: number;
  paybackPeriod: number;
  roi: number;
  monthlyReturn: number;
  npv: number;
  irr: number;
  recommendations: string[];
}
```

---

## 3. FUNCIONALIDAD ESPECÍFICA

### 3.1 Business Plan Builder/Simulator

#### **Flujo de Creación**

1. **Inicio:**
   - Usuario hace clic en "Crear Plan de Negocio"
   - Sistema verifica si ya existe un plan → Si existe, carga el existente; Si no, crea nuevo

2. **Selección de Template:**
   - 3 templates disponibles:
     - **Lean Startup Plan** (beginner, 30 min)
     - **Traditional Business Plan** (advanced, 120 min)
     - **Social Enterprise Plan** (intermediate, 90 min)

3. **Construcción por Secciones:**
   Cada template tiene múltiples secciones en orden:

   **Ejemplo: Lean Startup Plan**
   - **Sección 1: Resumen Ejecutivo**
     - ¿Qué problema resuelves? (textarea, 50-500 chars)
     - ¿Cuál es tu solución? (textarea, 50-500 chars)
     - ¿Quién es tu cliente objetivo? (textarea, 30-300 chars)
     - ¿Cómo generas ingresos? (textarea, 30-300 chars)

   - **Sección 2: Análisis de Mercado**
     - Tamaño del mercado TAM (currency)
     - Mercado objetivo SAM (currency)
     - Mercado alcanzable SOM (currency)
     - Principales competidores (textarea, 100-1000 chars)
     - Ventaja competitiva (textarea, 50-500 chars)

   - **Sección 3: Proyecciones Financieras**
     - Proyecciones de Ingresos (table: 3 años)
     - Proyecciones de Gastos (table: 3 años)
     - Financiamiento necesario (currency)
     - Fuentes de financiamiento (multiselect)
     - Punto de equilibrio en meses (number, 1-60)

4. **Validación en Tiempo Real:**
   - Cada campo tiene validaciones específicas:
     - `minLength`, `maxLength` para texto
     - `min`, `max` para números
     - `required` para campos obligatorios

   - **Sistema de Scoring:**
     - Cada campo vale 10 puntos máximo
     - Se otorgan puntos por:
       - Completitud (campo lleno)
       - Calidad del contenido (keywords, longitud)
       - Datos específicos (números, métricas)

5. **Completion Percentage:**
   - Calculado automáticamente por `BusinessPlanService.calculateCompletionPercentage()`
   - Considera:
     - 22 campos básicos requeridos
     - 5 campos de Triple Impact
     - 9 campos de Business Model Canvas
     - 4 campos de Financial Projections
   - **Total: ~40 campos**
   - Fórmula: `(completedFields / totalFields) * 100`

6. **Guardado:**
   - **Auto-save** cada 30 segundos (draft)
   - **Save manual** con botón "Guardar"
   - **Estado:** `draft` → `completed` cuando completionPercentage >= 90%

#### **Validaciones Específicas**

```typescript
// Validaciones por tipo de campo

// TEXT/TEXTAREA
- minLength: Mínimo caracteres requeridos
- maxLength: Máximo caracteres permitidos
- Bonus: Si contiene keywords de negocio (+2 pts)
- Bonus: Si contiene números/datos (+1 pt)

// NUMBER/CURRENCY
- min: Valor mínimo
- max: Valor máximo
- Warning si valor = 0

// TABLE
- Debe tener al menos 1 fila
- Al menos 50% de celdas completas para puntuación completa

// MULTISELECT
- Al menos 1 opción seleccionada (required)
- Bonus: 3+ opciones (+2 pts)
```

#### **Exportación a PDF**

```typescript
// Usar BusinessPlanExportService
const blob = await BusinessPlanExportService.exportToPDF(
  template,
  businessPlanData,
  {
    format: 'pdf',
    includeCharts: true,
    includeExamples: false,
    includeTips: true,
    language: 'es'
  }
);

// Formatos disponibles: PDF, DOCX, HTML, JSON
```

**Contenido del PDF:**
- Portada con nombre del plan y logo CEMSE
- Tabla de contenidos
- Todas las secciones completadas
- Business Model Canvas (visual)
- Triple Impact Analysis
- Proyecciones financieras (tablas y gráficos)
- Tips y recomendaciones (opcional)
- Footer con fecha de generación

---

### 3.2 Financial Calculator

#### **Métricas Calculadas**

1. **Revenue Projections (Proyecciones de Ingresos)**
   ```typescript
   revenue[month] = currentRevenue * (1 + growthRate)^(month-1)
   ```

2. **Break-Even Analysis**
   ```typescript
   breakEvenRevenue = fixedCosts / (1 - variableCostRate)
   breakEvenMonth = primer mes donde cumulativeProfit >= 0
   ```

3. **Burn Rate & Runway**
   ```typescript
   monthlyBurnRate = fixedCosts + variableCosts - monthlyRevenue
   runway = totalInvestment / abs(monthlyBurnRate)  // en meses
   ```

4. **ROI & Payback Period**
   ```typescript
   ROI = (annualProfit / totalInvestment) * 100
   paybackPeriod = totalInvestment / monthlyProfit  // en meses
   ```

5. **NPV (Net Present Value)**
   ```typescript
   NPV = -initialInvestment + Σ(cashFlow[month] / (1 + discountRate)^(month/12))
   discountRate = 0.1  // 10% por defecto
   ```

6. **IRR (Internal Rate of Return)**
   - Calculado usando método Newton-Raphson
   - Retorna la tasa de descuento donde NPV = 0

#### **Inputs Requeridos**

| Categoría | Campos |
|-----------|--------|
| **Ingresos** | `monthlyRevenue`, `revenueGrowthRate`, `revenueProjectionMonths` |
| **Costos Fijos** | `rent`, `salaries`, `insurance`, `utilities`, `marketing`, `otherFixedCosts` |
| **Costos Variables** | `costOfGoodsSold` (%), `variableCosts` |
| **Costos Iniciales** | `equipment`, `initialInventory`, `legalFees`, `otherOneTimeCosts` |
| **Inversión** | `initialInvestment`, `additionalInvestment` |
| **Metas** | `targetMonthlyProfit`, `targetRevenue` |

#### **Outputs Generados**

```typescript
{
  // Proyecciones mensuales (array de 12-36 meses)
  projections: FinancialProjection[],

  // Análisis de equilibrio
  breakEven: {
    breakEvenPoint: number,
    breakEvenRevenue: number,
    monthsToBreakEven: number,
    isAchievable: boolean,
    recommendations: string[]
  },

  // Análisis de inversión
  investment: {
    totalInvestment: number,
    monthlyBurnRate: number,
    runway: number,
    roi: number,
    paybackPeriod: number,
    npv: number,
    irr: number,
    recommendations: string[]
  },

  // Resumen
  summary: {
    totalRevenue: number,
    totalExpenses: number,
    netProfit: number,
    profitMargin: number,
    growthRate: number
  }
}
```

#### **Fórmulas Específicas**

**Customer Lifetime Value (CLV):**
```typescript
CLV = averageOrderValue * purchaseFrequency * (1 / churnRate)
```

**LTV:CAC Ratio:**
```typescript
ltvCacRatio = CLV / customerAcquisitionCost
// Ideal: >= 3
```

**Compound Interest:**
```typescript
finalAmount = principal * (1 + rate/frequency)^(years * frequency)
```

---

### 3.3 Business Model Canvas

#### **Componentes del Canvas**

El Business Model Canvas tiene **9 bloques fundamentales:**

```typescript
interface BusinessModelCanvas {
  // 1. KEY PARTNERS (Socios Clave)
  keyPartners: string;
  // "¿Quiénes son tus socios clave? ¿Qué recursos adquieren de ellos?"

  // 2. KEY ACTIVITIES (Actividades Clave)
  keyActivities: string;
  // "¿Qué actividades clave requiere tu propuesta de valor?"

  // 3. VALUE PROPOSITIONS (Propuestas de Valor)
  valuePropositions: string;
  // "¿Qué valor entregas al cliente?"

  // 4. CUSTOMER RELATIONSHIPS (Relaciones con Clientes)
  customerRelationships: string;
  // "¿Qué tipo de relación estableces con cada segmento?"

  // 5. CUSTOMER SEGMENTS (Segmentos de Clientes)
  customerSegments: string;
  // "¿Para quién estás creando valor?"

  // 6. KEY RESOURCES (Recursos Clave)
  keyResources: string;
  // "¿Qué recursos clave requiere tu propuesta de valor?"

  // 7. CHANNELS (Canales)
  channels: string;
  // "¿A través de qué canales entregas tu propuesta de valor?"

  // 8. COST STRUCTURE (Estructura de Costos)
  costStructure: string;
  // "¿Cuáles son los costos más importantes?"

  // 9. REVENUE STREAMS (Fuentes de Ingresos)
  revenueStreams: string;
  // "¿Por qué están dispuestos a pagar los clientes?"
}
```

#### **Guardado en el Servidor**

- El Canvas se guarda como parte del `BusinessPlan`
- Campo: `businessModelCanvas: BusinessModelCanvas`
- Se incluye en el cálculo de `completionPercentage`
- Peso: 9 campos (uno por bloque) en el total

#### **Exportación**

```typescript
// 1. Exportar como imagen
const canvasElement = document.querySelector('.business-model-canvas');
const canvas = await html2canvas(canvasElement);
const image = canvas.toDataURL('image/png');

// 2. Exportar como PDF
import { BusinessModelCanvasPDF } from '@/components/entrepreneurship/BusinessModelCanvasPDF';
<BusinessModelCanvasPDF businessPlan={plan} />
```

**Características de la exportación:**
- Layout visual fiel al canvas original
- Colores diferenciados por bloque
- Incluye logo del emprendimiento
- Footer con fecha y nombre del plan

---

### 3.4 Entrepreneur Network (Red de Emprendedores)

#### **Flujo de Conexiones**

```
1. Usuario busca emprendedores
2. Lista de usuarios disponibles
3. ¿Ya están conectados?
   - No → Botón: Enviar Solicitud
   - Sí → Botón: Ver Perfil
   - Pendiente → Botón: Solicitud Enviada
4. Enviar Solicitud → Modal: Mensaje opcional
5. POST /api/entrepreneurship/connections
6. Validación:
   - Perfil completo (ambos usuarios)
   - No auto-conexión
   - No solicitud duplicada
7. Estado: PENDING
8. Notificación al destinatario
9. Destinatario ve solicitud
10. Acción:
    - Aceptar → PUT /connections/id - status: ACCEPTED
    - Rechazar → PUT /connections/id - status: DECLINED
11. Si aceptada → Ambos son conexiones
```

#### **Estados de Conexión**

```typescript
enum ConnectionStatus {
  PENDING = "PENDING",      // Solicitud enviada, esperando respuesta
  ACCEPTED = "ACCEPTED",    // Conexión establecida
  DECLINED = "DECLINED"     // Solicitud rechazada
}
```

**Reglas de Transición:**
- `PENDING` → `ACCEPTED` (destinatario acepta)
- `PENDING` → `DECLINED` (destinatario rechaza)
- `ACCEPTED` no puede cambiar (solo eliminar conexión)
- `DECLINED` no puede cambiar (solo eliminar y crear nueva)

#### **Perfiles de Emprendedor**

```typescript
interface User {
  id: string;
  name: string;
  email: string;
  image?: string;
  createdAt: string;

  _count: {
    entrepreneurshipPosts: number;  // Cantidad de posts
  };

  // Estado de conexión con el usuario actual
  connectionStatus?: {
    id: string;
    status: ConnectionStatus;
    isRequester: boolean;  // true si el usuario actual envió la solicitud
  } | null;
}
```

#### **Mensajería Directa**

**Nota:** Actualmente NO implementada. Se planea para futuras versiones.

Plan propuesto:
- Chat 1-on-1 entre conexiones aceptadas
- Notificaciones en tiempo real con WebSockets
- Historial de mensajes

---

### 3.5 Resource Center

#### **Tipos de Recursos**

```typescript
enum ResourceType {
  GUIDE = "GUIDE",           // Guías paso a paso
  TEMPLATE = "TEMPLATE",     // Plantillas descargables (Excel, Word, etc.)
  VIDEO = "VIDEO",           // Videos educativos
  ARTICLE = "ARTICLE",       // Artículos y blogs
  TOOL = "TOOL",             // Herramientas interactivas
  EBOOK = "EBOOK",           // Libros electrónicos
  COURSE = "COURSE",         // Cursos completos
  WEBINAR = "WEBINAR"        // Webinars grabados
}
```

#### **Categorización**

Los recursos se categorizan por:

1. **Tipo** (ResourceType)
2. **Categoría** (string libre):
   - "Finanzas"
   - "Marketing"
   - "Legal"
   - "Tecnología"
   - "Ventas"
   - "Operaciones"
   - "Recursos Humanos"

3. **Tags** (array de strings):
   - #startup
   - #lean
   - #pitch
   - #funding
   - etc.

#### **Descarga de Recursos**

```typescript
// Recursos con fileUrl son descargables
if (resource.fileUrl) {
  // Download button disponible
  window.open(resource.fileUrl, '_blank');
}

// Recursos con url abren en nueva pestaña
if (resource.url) {
  window.open(resource.url, '_blank');
}
```

#### **Tracking de Uso**

**Métricas rastreadas:**
- **Views:** Se incrementa cada vez que se visualiza el detalle
- **Likes:** Usuario puede dar like
- **Downloads:** Se cuenta cada descarga (si aplica)

```typescript
// Al abrir un recurso
await fetch(`/api/entrepreneurship/resources/${id}`, {
  method: 'POST',
  body: JSON.stringify({ action: 'view' })
});

// Al dar like
await fetch(`/api/entrepreneurship/resources/${id}/like`, {
  method: 'POST'
});
```

---

## 4. LÓGICA DE NEGOCIO Y VALIDACIONES

### 4.1 Reglas de Creación de Business Plans

1. **Un plan por usuario (inicialmente):**
   - El sistema verifica si el usuario ya tiene un plan
   - Si existe, carga el existente para edición
   - Si no existe, crea uno nuevo

2. **Validaciones de Entrada:**
   ```typescript
   // Campos requeridos
   - userId (string, no vacío)
   - title (string, no vacío)
   - description (string, no vacío)
   - industry (string, no vacío)
   - stage (enum: 'idea' | 'startup' | 'growth' | 'mature')
   - fundingGoal (number, >= 0)
   ```

3. **Sanitización de Datos:**
   ```typescript
   // Se eliminan scripts maliciosos
   sanitizeString = (str) =>
     str.trim().replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');

   // Se aplica a todos los campos de texto
   ```

4. **Límites:**
   - **No hay límite** de cantidad de planes (puede cambiar en futuras versiones)
   - **No hay límite** de actualizaciones
   - **No hay límite temporal** de borrador

### 4.2 Conexiones y Networking

1. **Reglas de Solicitud:**
   - ✅ Ambos usuarios deben tener perfil completo
   - ✅ No se puede enviar solicitud a uno mismo
   - ✅ No se puede duplicar solicitud (verifica si ya existe)
   - ✅ Si existe solicitud `DECLINED`, se puede crear nueva

2. **Límites:**
   - **No hay límite** de conexiones por usuario
   - **No hay límite** de solicitudes enviadas/recibidas

3. **Privacidad:**
   - Solo conexiones `ACCEPTED` pueden ver perfiles completos
   - Posts son visibles para todos (públicos)

### 4.3 Validación de Business Plans

```typescript
interface ValidationResult {
  isValid: boolean;
  score: number;              // Puntuación total obtenida
  maxScore: number;           // Puntuación máxima posible
  percentage: number;         // score / maxScore * 100
  errors: ValidationError[];   // Errores críticos (required fields)
  warnings: ValidationWarning[]; // Advertencias no críticas
  suggestions: ValidationSuggestion[]; // Sugerencias de mejora
  sectionScores: SectionScore[]; // Puntuación por sección
}
```

**Niveles de Calidad:**
- **Excellent:** >= 90%, 0 errores
- **Good:** >= 75%, <= 2 errores
- **Fair:** >= 50%, <= 5 errores
- **Poor:** < 50%

---

## 5. INTEGRACIONES

### 5.1 Con Módulo de Courses

**No hay integración directa actualmente.**

Potencial futuro:
- Recomendar cursos basados en la industria del business plan
- Completar cursos para desbloquear recursos premium

### 5.2 Con Módulo de Jobs

**No hay integración directa actualmente.**

Potencial futuro:
- Buscar empleo en startups relacionadas a tu emprendimiento
- Publicar ofertas de trabajo para tu startup

### 5.3 Con Módulo de Profile

**✅ Integración Activa:**

1. **Perfil requerido para conexiones:**
   ```typescript
   // Antes de crear conexión, se verifica:
   const profile = await prisma.profile.findUnique({
     where: { userId }
   });

   if (!profile) {
     throw new Error("Completa tu perfil primero");
   }
   ```

2. **Datos compartidos:**
   - `firstName`, `lastName`, `avatarUrl` desde Profile
   - Se muestran en posts, conexiones, comentarios

### 5.4 Con Sistema de Archivos (MinIO)

**✅ Integración Activa:**

- **Business Plan:** Puede incluir archivos adjuntos
- **Resources:** Se almacenan PDFs, Excel, etc. en MinIO
- **Posts:** Imágenes de posts se suben a MinIO
- **Canvas & PDFs:** Se generan y almacenan en MinIO

---

## 6. FEATURES ESPECIALES

### 6.1 Sistema de Notificaciones

**Estado Actual:** Parcialmente implementado

- ✅ Conexiones pendientes (se muestran en `/entrepreneurship/connections`)
- ❌ Notificaciones en tiempo real (no implementadas con WebSockets)
- ❌ Notificaciones push

**Notificaciones planificadas:**
- Nueva solicitud de conexión recibida
- Solicitud de conexión aceptada/rechazada
- Nuevo comentario en tu post
- Like en tu post
- Mención en comentario

### 6.2 Analytics de Emprendimiento

**Endpoint:** `/api/entrepreneurship/entrepreneurships/[id]/analytics`

**Métricas disponibles:**
- **Views:** Cantidad de vistas del emprendimiento
- **Engagement:** Likes, shares, comments en posts
- **Network Growth:** Crecimiento de conexiones en el tiempo
- **Resource Downloads:** Descargas de recursos propios

**Visualización:**
- Gráficos de línea (tendencias)
- Gráficos de barras (comparativas)
- KPIs (números grandes)

### 6.3 Gamificación

**Estado Actual:** NO implementada

**Plan Propuesto:**
- Badges/Insignias:
  - "First Plan" - Primer plan de negocio completado
  - "Networker" - 10 conexiones aceptadas
  - "Thought Leader" - 50 posts publicados
  - "Helpful" - 100 likes recibidos
- Niveles de usuario:
  - Beginner → Intermediate → Advanced → Expert
- Puntos por actividad:
  - +10 pts por crear business plan
  - +5 pts por conexión aceptada
  - +2 pts por post publicado
  - +1 pt por like dado/recibido

### 6.4 Colaboración en Business Plans

**Estado Actual:** NO implementada

**Plan Propuesto:**
- Compartir plan con otros usuarios (read-only o edit)
- Comentarios en secciones específicas
- Control de versiones (history)
- Roles: Owner, Editor, Viewer

---

## 7. ESTADOS Y TRANSICIONES

### 7.1 Business Plan Statuses

```typescript
enum BusinessPlanStatus {
  DRAFT = "draft",           // En construcción
  COMPLETED = "completed",   // Completado (>= 90% completion)
  PUBLISHED = "published"    // Publicado (visible para otros)
}
```

**Transiciones:**
```
draft → completed (automático cuando completionPercentage >= 90%)
completed → published (manual, usuario decide compartir)
published → draft (manual, usuario decide ocultar)
```

### 7.2 Connection Statuses

```
PENDING → ACCEPTED
PENDING → DECLINED
```

### 7.3 Post Statuses

```typescript
// Los posts no tienen estado explícito
// Están siempre "publicados" al crearse
// Se pueden eliminar pero no hay "draft" o "archived"
```

---

## 8. MANEJO DE ERRORES

### 8.1 Mensajes de Error Específicos

#### Business Plans

| Código | Mensaje | Situación |
|--------|---------|-----------|
| 400 | "Title is required" | Falta título |
| 400 | "Description is required" | Falta descripción |
| 400 | "Invalid stage" | Stage no es válido |
| 401 | "Unauthorized" | No hay sesión activa |
| 403 | "Forbidden" | Usuario no es dueño del plan |
| 404 | "Business plan not found" | Plan no existe |
| 409 | "Business plan already exists for this user" | Usuario ya tiene plan |
| 500 | "Failed to create/update/delete business plan" | Error de servidor |

#### Connections

| Código | Mensaje | Situación |
|--------|---------|-----------|
| 400 | "Addressee ID required" | Falta ID de destinatario |
| 400 | "Tu perfil no está completo" | Usuario sin perfil |
| 400 | "El usuario no tiene un perfil completo" | Destinatario sin perfil |
| 400 | "No puedes enviar una solicitud a ti mismo" | Intentando auto-conectar |
| 400 | "Ya existe una solicitud pendiente" | Solicitud duplicada |
| 400 | "Ya estás conectado con este usuario" | Conexión ya aceptada |
| 401 | "Unauthorized" | No hay sesión |
| 404 | "Connection not found" | Conexión no existe |
| 500 | "Failed to create/update/delete connection" | Error de servidor |

#### Posts

| Código | Mensaje | Situación |
|--------|---------|-----------|
| 400 | "Content is required" | Falta contenido |
| 401 | "Unauthorized" | No hay sesión |
| 403 | "Forbidden" | No es dueño del post |
| 404 | "Post not found" | Post no existe |
| 500 | "Failed to create/update/delete post" | Error de servidor |

### 8.2 Códigos de Error HTTP

- **400 Bad Request:** Datos inválidos enviados
- **401 Unauthorized:** No autenticado
- **403 Forbidden:** No tiene permisos
- **404 Not Found:** Recurso no existe
- **409 Conflict:** Conflicto (duplicado)
- **500 Internal Server Error:** Error del servidor

---

## 9. PERMISOS Y SEGURIDAD

### 9.1 Visibilidad de Business Plans

**Regla General:** Solo el dueño puede ver/editar su business plan

| Acción | Requiere | Condición |
|--------|----------|-----------|
| Ver plan | Autenticación | `plan.userId === session.user.id` |
| Editar plan | Autenticación | `plan.userId === session.user.id` |
| Eliminar plan | Autenticación | `plan.userId === session.user.id` |
| Ver plan público | Ninguna | `plan.status === 'published'` (futuro) |

### 9.2 Datos Privados vs Públicos

#### **Privados (solo el dueño):**
- Business Plan completo (mientras status = draft/completed)
- Financial Projections detalladas
- Connection requests recibidas
- Mensajes privados (futuro)

#### **Públicos (visibles para todos):**
- Posts en el feed
- Perfil básico (nombre, avatar)
- Entrepreneurships publicados (`isPublic: true`)
- Resources públicas (`isPublic: true`)
- News publicadas (`isPublished: true`)

### 9.3 Configuración de Privacidad

**Estado Actual:** NO implementada

**Plan Propuesto:**
```typescript
interface PrivacySettings {
  // ¿Quién puede ver mi perfil?
  profileVisibility: 'public' | 'connections' | 'private';

  // ¿Quién puede enviarme solicitudes?
  connectionRequests: 'everyone' | 'connectionsOfConnections' | 'none';

  // ¿Quién puede ver mis posts?
  postsVisibility: 'public' | 'connections' | 'private';

  // ¿Quién puede comentar en mis posts?
  commentsPermission: 'everyone' | 'connections' | 'none';

  // ¿Mostrar mis conexiones?
  showConnections: boolean;

  // ¿Mostrar mi business plan públicamente?
  showBusinessPlan: boolean;
}
```

---

## 10. HOOKS PERSONALIZADOS

### 10.1 useBusinessPlans

```typescript
// Listar business plans del usuario
const {
  data,           // { businessPlans: [], total, hasMore }
  isLoading,
  error
} = useBusinessPlans({
  limit: 10,
  offset: 0,
  status: 'draft'
});

// Obtener un business plan específico
const {
  data: businessPlan,
  isLoading,
  error
} = useBusinessPlan(id);

// Crear business plan
const {
  mutateAsync: createBusinessPlan,
  isPending
} = useCreateBusinessPlan();

// Actualizar business plan
const {
  mutateAsync: updateBusinessPlan,
  isPending
} = useUpdateBusinessPlan();

// Eliminar business plan
const {
  mutateAsync: deleteBusinessPlan,
  isPending
} = useDeleteBusinessPlan();
```

### 10.2 useEntrepreneurshipConnections

```typescript
// Listar conexiones
const {
  connections,    // Array de conexiones
  pagination,     // { page, limit, total, pages }
  isLoading,
  error,
  refetch,
  createConnection,
  isCreating,
  updateConnection,
  isUpdating,
  deleteConnection,
  isDeleting
} = useEntrepreneurshipConnections({
  type: 'all',      // 'all' | 'sent' | 'received'
  status: 'PENDING', // 'PENDING' | 'ACCEPTED' | 'DECLINED'
  page: 1,
  limit: 20
});

// Crear conexión
await createConnection({
  addresseeId: 'user-id',
  message: 'Hola, me gustaría conectar contigo'
});

// Actualizar conexión (aceptar/rechazar)
await updateConnection({
  connectionId: 'conn-id',
  status: 'ACCEPTED'
});

// Eliminar conexión
await deleteConnection('conn-id');
```

**Hooks especializados:**
```typescript
useSentConnections()      // type: 'sent'
useReceivedConnections()  // type: 'received'
useAcceptedConnections()  // status: 'ACCEPTED'
usePendingConnections()   // status: 'PENDING'
```

### 10.3 useEntrepreneurshipPosts

```typescript
const {
  posts,
  pagination,
  isLoading,
  error,
  refetch,
  createPost,
  isCreating,
  updatePost,
  isUpdating,
  deletePost,
  isDeleting
} = useEntrepreneurshipPosts({
  page: 1,
  limit: 20,
  type: 'TEXT',
  search: '',
  authorId: ''
});

// Crear post
await createPost({
  content: 'Mi nuevo post',
  type: 'TEXT',
  images: [],
  tags: ['startup', 'Bolivia']
});
```

**Hooks relacionados:**
```typescript
// Like a post
const { toggleLike, isLiking } = usePostLike(postId);
await toggleLike();

// Share post
const { sharePost, isSharing } = usePostShare(postId);
await sharePost();

// Comments
const {
  comments,
  createComment,
  isCreating
} = usePostComments(postId);

await createComment({
  content: 'Gran post!',
  parentId: null  // null para comentario raíz
});
```

### 10.4 useEntrepreneurshipNews & Resources

```typescript
// News
const { news, pagination, isLoading } = useLatestNews(6);
const { news } = usePublishedNews();
const { news } = useNewsByCategory('Technology', 12);

// Resources
const { resources, pagination, isLoading } = useFeaturedResources();
const { resources } = useResourcesByType('GUIDE', 12);
const { resources } = useResourcesByCategory('Marketing', 12);
```

---

## 11. SERVICIOS CLAVE

### 11.1 BusinessPlanService

```typescript
class BusinessPlanService {
  // CRUD operations
  static async createBusinessPlan(data: BusinessPlanData): Promise<BusinessPlanData>
  static async getBusinessPlan(id: string): Promise<BusinessPlanData | null>
  static async getUserBusinessPlans(userId: string, options): Promise<{...}>
  static async updateBusinessPlan(id: string, data: Partial<BusinessPlanData>): Promise<BusinessPlanData>
  static async deleteBusinessPlan(id: string): Promise<void>

  // Utilities
  static calculateCompletionPercentage(plan: BusinessPlanData): number
  static generateSummary(plan: BusinessPlanData): string
  static async exportToPDF(plan: BusinessPlanData): Promise<Buffer>

  // Validation
  private static validateBusinessPlanData(data: BusinessPlanData): void
  private static sanitizeBusinessPlanData(data: BusinessPlanData): BusinessPlanData
}
```

### 11.2 FinancialCalculatorService

```typescript
class FinancialCalculatorService {
  // Calculations
  static calculateMonthlyProjections(financials: StartupFinancials): FinancialProjection[]
  static calculateBreakEven(financials: StartupFinancials): BreakEvenAnalysis
  static calculateInvestmentAnalysis(financials: StartupFinancials): InvestmentAnalysis
  static generateFinancialSummary(financials: StartupFinancials): {...}

  // Helpers
  static calculateSimpleBreakEven(inputs): { units, revenue, months }
  static calculateRevenueProjections(inputs): Projection[]
  static calculateCustomerMetrics(inputs): {...}
  static calculateValuation(inputs): {...}

  // Formatting
  static formatCurrency(amount: number, currency = 'USD'): string
  static formatPercentage(value: number, decimals = 1): string
}
```

### 11.3 BusinessPlanValidationService

```typescript
class BusinessPlanValidationService {
  // Main validation
  static validateBusinessPlan(template, data): ValidationResult

  // Section/Field validation
  private static validateSection(section, data): SectionResult
  private static validateField(field, value): FieldResult

  // Specific validators
  private static validateTextField(...)
  private static validateNumberField(...)
  private static validateTableField(...)
  private static validateMultiselectField(...)

  // Scoring
  private static scoreTextQuality(text, fieldId): number

  // Keywords checks
  private static containsBusinessKeywords(text): boolean
  private static containsProblemKeywords(text): boolean
  private static containsSolutionKeywords(text): boolean

  // Summary
  static getValidationSummary(result): {
    status: 'excellent' | 'good' | 'fair' | 'poor',
    message: string,
    nextSteps: string[]
  }
}
```

### 11.4 BusinessPlanExportService

```typescript
class BusinessPlanExportService {
  // Export methods
  static async exportToPDF(template, data, options): Promise<Blob>
  static async exportToDOCX(template, data, options): Promise<Blob>
  static async exportToHTML(template, data, options): Promise<Blob>
  static async exportToJSON(template, data, options): Promise<Blob>

  // Helpers
  static downloadFile(blob: Blob, filename: string): void
  static getFilename(template, format): string

  // Internal generators
  private static generateHTML(...)
  private static generateSectionHTML(...)
  private static generateFieldHTML(...)
  private static generateTableHTML(...)
}
```

---

## 12. TEMPLATES DE BUSINESS PLAN

### 12.1 Lean Startup Plan

**Dificultad:** Beginner
**Tiempo estimado:** 30 minutos
**Secciones:** 3

1. **Resumen Ejecutivo**
   - ¿Qué problema resuelves?
   - ¿Cuál es tu solución?
   - ¿Quién es tu cliente objetivo?
   - ¿Cómo generas ingresos?

2. **Análisis de Mercado**
   - Tamaño del mercado (TAM, SAM, SOM)
   - Principales competidores
   - Ventaja competitiva

3. **Proyecciones Financieras**
   - Proyecciones de ingresos (3 años)
   - Proyecciones de gastos (3 años)
   - Financiamiento necesario
   - Fuentes de financiamiento
   - Punto de equilibrio

### 12.2 Traditional Business Plan

**Dificultad:** Advanced
**Tiempo estimado:** 120 minutos
**Secciones:** 7

1. Resumen Ejecutivo
2. Descripción de la Empresa
3. Análisis de Mercado
4. Estrategia de Marketing
5. Plan de Operaciones
6. Proyecciones Financieras
7. Análisis de Riesgos

### 12.3 Social Enterprise Plan

**Dificultad:** Intermediate
**Tiempo estimado:** 90 minutos
**Secciones:** 2

1. **Misión Social**
   - Problema social
   - Impacto social esperado
   - Beneficiarios
   - Medición del impacto

2. **Modelo de Sostenibilidad**
   - Modelo de ingresos
   - Estrategia de financiamiento
   - Estrategia de escalamiento

---

## 13. EJEMPLOS DE REQUEST/RESPONSE

### 13.1 Crear Business Plan

**Request:**
```http
POST /api/business-plans
Content-Type: application/json
Authorization: Bearer {session-token}

{
  "title": "AgroTech Bolivia",
  "description": "Plataforma para conectar agricultores con compradores",
  "industry": "Agricultura",
  "stage": "idea",
  "fundingGoal": 50000,
  "currentFunding": 0,
  "teamSize": 3,
  "marketSize": 500000,
  "targetMarket": "Pequeños agricultores en zonas rurales de Bolivia",
  "problemStatement": "Los agricultores pierden 30% de sus cultivos por falta de información sobre el clima y precios de mercado",
  "solution": "App móvil que proporciona alertas meteorológicas precisas y datos de precios en tiempo real",
  "valueProposition": "Aumentar ingresos de agricultores en 25% reduciendo pérdidas y mejorando decisiones de venta",
  "businessModel": "Suscripción mensual de $5 por agricultor + comisión del 3% en ventas",
  "revenueStreams": ["Suscripciones", "Comisiones de venta", "Publicidad"],
  "costStructure": ["Desarrollo de software", "Servidores", "Marketing"],
  "keyMetrics": ["Usuarios activos", "Ingresos por usuario", "Retención"],
  "competitiveAdvantage": "Única app en español específica para el clima boliviano",
  "marketingStrategy": "Marketing digital y alianzas con cooperativas agrícolas",
  "operationsPlan": "Equipo de 3 desarrolladores, 1 agrónomo, 1 comercial",
  "tripleImpactAssessment": {
    "problemSolved": "Pérdida de cultivos y bajos ingresos de agricultores",
    "beneficiaries": "10,000 agricultores en el primer año",
    "resourcesUsed": "Datos meteorológicos públicos y APIs de precios",
    "communityInvolvement": "Cooperativas agrícolas locales",
    "longTermImpact": "Reducir pobreza rural en 15% en 5 años"
  },
  "businessModelCanvas": {
    "keyPartners": "Cooperativas, proveedores de datos, bancos rurales",
    "keyActivities": "Desarrollo de software, recolección de datos, atención al cliente",
    "valuePropositions": "Información precisa y oportuna para maximizar ingresos agrícolas",
    "customerRelationships": "Soporte 24/7, comunidad online",
    "customerSegments": "Pequeños agricultores, cooperativas",
    "keyResources": "Desarrolladores, datos meteorológicos, infraestructura cloud",
    "channels": "App móvil, WhatsApp, agentes locales",
    "costStructure": "Desarrollo, servidores, marketing, salarios",
    "revenueStreams": "Suscripciones, comisiones, publicidad"
  },
  "financialProjections": {
    "startupCosts": 20000,
    "monthlyRevenue": 500,
    "monthlyExpenses": 2000,
    "breakEvenMonth": 12,
    "revenueStreams": ["Suscripciones"],
    "initialInvestment": 50000,
    "monthlyOperatingCosts": 2000,
    "revenueProjection": 60000,
    "breakEvenPoint": 400,
    "estimatedROI": 20
  },
  "executiveSummary": "AgroTech Bolivia es una plataforma digital que ayuda a pequeños agricultores...",
  "businessDescription": "Somos una startup de tecnología agrícola...",
  "marketAnalysis": "El mercado agrícola boliviano vale $500M...",
  "competitiveAnalysis": "Nuestros principales competidores son...",
  "operationalPlan": "Operaremos con un equipo lean de 5 personas...",
  "managementTeam": "CEO: Juan Pérez (10 años en agroindustria)...",
  "riskAnalysis": "Principales riesgos: adopción tecnológica, competencia...",
  "appendices": "",
  "team": [
    {
      "name": "Juan Pérez",
      "role": "CEO & Co-Founder",
      "experience": "10 años en agroindustria",
      "skills": ["Gestión", "Ventas", "Agronomía"],
      "equity": 40,
      "isFounder": true
    }
  ],
  "milestones": [
    {
      "id": "m1",
      "title": "MVP lanzado",
      "description": "Primera versión de la app",
      "targetDate": "2025-06-30",
      "status": "pending",
      "priority": "high",
      "dependencies": []
    }
  ],
  "risks": [
    {
      "id": "r1",
      "title": "Baja adopción tecnológica",
      "description": "Agricultores pueden ser reacios a usar tecnología",
      "probability": "medium",
      "impact": "high",
      "mitigation": "Capacitaciones presenciales y soporte local",
      "owner": "Juan Pérez"
    }
  ]
}
```

**Response (201 Created):**
```json
{
  "businessPlan": {
    "id": "bp_123456789",
    "userId": "user_987654321",
    "title": "AgroTech Bolivia",
    "description": "Plataforma para conectar agricultores con compradores",
    "industry": "Agricultura",
    "stage": "idea",
    "fundingGoal": 50000,
    "currentFunding": 0,
    "teamSize": 3,
    "marketSize": 500000,
    "targetMarket": "Pequeños agricultores en zonas rurales de Bolivia",
    "problemStatement": "Los agricultores pierden 30% de sus cultivos...",
    "solution": "App móvil que proporciona alertas meteorológicas...",
    "valueProposition": "Aumentar ingresos de agricultores en 25%...",
    "businessModel": "Suscripción mensual de $5 por agricultor...",
    "revenueStreams": ["Suscripciones", "Comisiones de venta", "Publicidad"],
    "costStructure": ["Desarrollo de software", "Servidores", "Marketing"],
    "keyMetrics": ["Usuarios activos", "Ingresos por usuario", "Retención"],
    "competitiveAdvantage": "Única app en español específica...",
    "marketingStrategy": "Marketing digital y alianzas...",
    "operationsPlan": "Equipo de 3 desarrolladores...",
    "tripleImpactAssessment": { ... },
    "businessModelCanvas": { ... },
    "financialProjections": { ... },
    "executiveSummary": "...",
    "businessDescription": "...",
    "marketAnalysis": "...",
    "competitiveAnalysis": "...",
    "operationalPlan": "...",
    "managementTeam": "...",
    "riskAnalysis": "...",
    "appendices": "",
    "team": [ ... ],
    "milestones": [ ... ],
    "risks": [ ... ],
    "completionPercentage": 85,
    "createdAt": "2025-09-30T10:30:00.000Z",
    "updatedAt": "2025-09-30T10:30:00.000Z"
  }
}
```

### 13.2 Crear Conexión

**Request:**
```http
POST /api/entrepreneurship/connections
Content-Type: application/json
Authorization: Bearer {session-token}

{
  "addresseeId": "user_555555555",
  "message": "Hola María, vi tu perfil y me interesa conectar para intercambiar ideas sobre startups en Bolivia."
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "connection": {
    "id": "conn_123456789",
    "requesterId": "user_987654321",
    "addresseeId": "user_555555555",
    "status": "PENDING",
    "message": "Hola María, vi tu perfil...",
    "createdAt": "2025-09-30T10:35:00.000Z",
    "updatedAt": "2025-09-30T10:35:00.000Z"
  }
}
```

**Error Response (400 Bad Request):**
```json
{
  "error": "Tu perfil no está completo. Por favor, completa tu perfil antes de enviar solicitudes de conexión."
}
```

### 13.3 Crear Post

**Request:**
```http
POST /api/entrepreneurship/posts
Content-Type: application/json
Authorization: Bearer {session-token}

{
  "content": "¡Acabo de completar mi business plan en CEMSE! 🎉 Muy útil la herramienta de validación.",
  "type": "TEXT",
  "images": [],
  "tags": ["businessplan", "startup", "Bolivia"]
}
```

**Response (201 Created):**
```json
{
  "id": "post_123456789",
  "content": "¡Acabo de completar mi business plan...",
  "type": "TEXT",
  "images": [],
  "tags": ["businessplan", "startup", "Bolivia"],
  "likes": 0,
  "comments": 0,
  "shares": 0,
  "views": 0,
  "isPinned": false,
  "authorId": "user_987654321",
  "author": {
    "id": "profile_123",
    "firstName": "Juan",
    "lastName": "Pérez",
    "avatarUrl": "https://..."
  },
  "postLikes": [],
  "postComments": [],
  "createdAt": "2025-09-30T10:40:00.000Z",
  "updatedAt": "2025-09-30T10:40:00.000Z"
}
```

### 13.4 Listar Conexiones

**Request:**
```http
GET /api/entrepreneurship/connections?type=received&status=PENDING&page=1&limit=10
Authorization: Bearer {session-token}
```

**Response (200 OK):**
```json
{
  "connections": [
    {
      "id": "conn_111",
      "requesterId": "user_222",
      "addresseeId": "user_987654321",
      "status": "PENDING",
      "message": "Hola, me gustaría conectar contigo",
      "createdAt": "2025-09-30T09:00:00.000Z",
      "updatedAt": "2025-09-30T09:00:00.000Z",
      "acceptedAt": null,
      "requester": {
        "id": "user_222",
        "name": "María López",
        "email": "maria@example.com",
        "image": "https://..."
      },
      "addressee": {
        "id": "user_987654321",
        "name": "Juan Pérez",
        "email": "juan@example.com",
        "image": "https://..."
      }
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 5,
    "pages": 1
  }
}
```

---

## 14. FLUJOS COMPLETOS

### 14.1 Flujo: Crear y Completar Business Plan

```
1. Usuario navega a /entrepreneurship
2. Click en "Crear Plan de Negocio"
3. Sistema verifica si ya existe plan → Si existe, carga; Si no, modal de templates
4. Usuario selecciona "Lean Startup Plan"
5. Sistema carga secciones del template
6. Usuario completa Sección 1: Resumen Ejecutivo
   - Completa 4 campos de texto
   - Click "Siguiente" → Validación
   - Si hay errores, muestra mensajes
   - Si pasa, avanza a Sección 2
7. Usuario completa Sección 2: Análisis de Mercado
   - Completa campos de currency (TAM, SAM, SOM)
   - Completa textarea de competidores
   - Click "Siguiente"
8. Usuario completa Sección 3: Proyecciones Financieras
   - Completa tabla de ingresos (3 filas)
   - Completa tabla de gastos (3 filas)
   - Selecciona fuentes de financiamiento (multiselect)
   - Ingresa meses para equilibrio
   - Click "Siguiente"
9. Sistema calcula completionPercentage
10. Si >= 90%, muestra modal "¡Felicidades! Tu plan está completo"
11. Usuario puede:
    - Exportar a PDF
    - Editar secciones
    - Crear Business Model Canvas
    - Abrir Calculadora Financiera
12. Click "Exportar a PDF"
13. Sistema genera PDF usando BusinessPlanExportService
14. PDF se descarga automáticamente
```

### 14.2 Flujo: Conectar con Emprendedor

```
1. Usuario navega a /entrepreneurship/network
2. Sistema carga lista de usuarios (excluye ya conectados)
3. Usuario ve tarjeta de "María López"
   - Foto de perfil
   - Nombre
   - Cantidad de posts
   - Botón "Conectar"
4. Click en "Conectar"
5. Modal se abre: "Enviar solicitud de conexión"
   - Campo opcional: Mensaje personalizado
   - Botón "Enviar"
6. Usuario escribe: "Hola María, me interesa tu perfil..."
7. Click "Enviar"
8. Frontend: POST /api/entrepreneurship/connections
   Body: { addresseeId: "user_555", message: "Hola María..." }
9. Backend valida:
   - ✅ Usuario tiene perfil completo
   - ✅ María tiene perfil completo
   - ✅ No hay solicitud duplicada
   - ✅ No es auto-conexión
10. Backend crea conexión con status: PENDING
11. Frontend muestra notificación: "Solicitud enviada"
12. Botón cambia a "Solicitud enviada" (disabled)
13. María recibe notificación (futuro)
14. María navega a /entrepreneurship/connections?type=received
15. Ve solicitud de Juan
16. Click "Aceptar"
17. Frontend: PUT /api/entrepreneurship/connections/conn_123
    Body: { status: "ACCEPTED" }
18. Backend actualiza status → ACCEPTED, acceptedAt: now()
19. Ambos usuarios ahora son conexiones
20. Pueden ver perfiles completos y chatear (futuro)
```

### 14.3 Flujo: Publicar Post y Recibir Engagement

```
1. Usuario navega a /entrepreneurship
2. Tab "Feed" o página principal
3. Click en "Crear Post"
4. Modal se abre con formulario:
   - Campo: Contenido (textarea)
   - Selector: Tipo (TEXT, IMAGE, VIDEO, etc.)
   - Uploader: Imágenes (opcional)
   - Campo: Tags (ej: #startup, #Bolivia)
5. Usuario escribe: "¡Acabo de completar mi business plan! 🎉"
6. Selecciona tags: #businessplan, #startup
7. Click "Publicar"
8. Frontend: POST /api/entrepreneurship/posts
   Body: {
     content: "¡Acabo de completar...",
     type: "TEXT",
     images: [],
     tags: ["businessplan", "startup"]
   }
9. Backend crea post en DB
10. Frontend refresca feed
11. Post aparece en la parte superior
12. Otro usuario (María) ve el post
13. María hace click en ❤️ (Like)
14. Frontend: POST /api/entrepreneurship/posts/post_123/like
15. Backend:
    - Verifica si ya dio like → Si sí, quita like; Si no, agrega like
    - Incrementa contador de likes en el post
16. Frontend actualiza UI: ❤️ 1 like
17. María hace click en "Comentar"
18. Escribe: "¡Felicitaciones! ¿Qué template usaste?"
19. Click "Enviar"
20. Frontend: POST /api/entrepreneurship/posts/post_123/comments
    Body: { content: "¡Felicitaciones!...", parentId: null }
21. Backend crea comentario
22. Frontend refresca comentarios
23. Comentario aparece debajo del post
24. Juan (dueño del post) recibe notificación (futuro)
25. Juan puede responder al comentario (reply)
```

---

## 15. MEJORES PRÁCTICAS Y RECOMENDACIONES

### 15.1 Para Usuarios (YOUTH)

1. **Completa tu perfil primero**
   - Antes de enviar conexiones, asegúrate de tener foto y datos completos

2. **Usa el Business Plan Builder paso a paso**
   - No intentes llenar todo de una vez
   - Guarda frecuentemente (auto-save cada 30s)
   - Usa los tips de cada sección

3. **Conecta con emprendedores relevantes**
   - Lee perfiles antes de enviar solicitudes
   - Personaliza el mensaje de conexión

4. **Participa en la comunidad**
   - Publica posts sobre tu progreso
   - Comenta y da like a otros posts
   - Comparte recursos útiles

5. **Usa la Calculadora Financiera**
   - Antes de presentar tu plan a inversores
   - Para validar viabilidad financiera
   - Exporta reportes para incluir en tu plan

### 15.2 Para Desarrolladores

1. **Siempre validar sesión en API routes**
   ```typescript
   const session = await getServerSession(authOptions);
   if (!session?.user?.id) {
     return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
   }
   ```

2. **Verificar ownership antes de editar/eliminar**
   ```typescript
   if (resource.userId !== session.user.id) {
     return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
   }
   ```

3. **Sanitizar inputs del usuario**
   ```typescript
   import { sanitizeBusinessPlanData } from '@/lib/businessPlanService';
   const clean = sanitizeBusinessPlanData(userInput);
   ```

4. **Usar React Query para cache**
   ```typescript
   // Invalidar cache después de mutaciones
   queryClient.invalidateQueries({ queryKey: ['businessPlans'] });
   ```

5. **Manejar errores gracefully**
   ```typescript
   try {
     // operation
   } catch (error) {
     console.error('Error details:', error);
     toast.error('Algo salió mal. Intenta de nuevo.');
   }
   ```

---

## 16. ROADMAP Y FEATURES FUTURAS

### 16.1 Corto Plazo (1-3 meses)

- ✅ **Notificaciones en tiempo real** con WebSockets
- ✅ **Chat directo** entre conexiones aceptadas
- ✅ **Gamificación**: Badges y puntos
- ✅ **Mejoras en Business Model Canvas**: Drag & drop
- ✅ **Comentarios en secciones** del Business Plan

### 16.2 Mediano Plazo (3-6 meses)

- ✅ **Colaboración en Business Plans**: Múltiples editores
- ✅ **Marketplace de recursos**: Compra/venta de templates
- ✅ **Eventos y webinars**: Calendario de eventos
- ✅ **Mentoría**: Matching con mentores
- ✅ **Pitch Deck Generator**: Crear presentaciones

### 16.3 Largo Plazo (6-12 meses)

- ✅ **Funding Matching**: Conectar con inversionistas
- ✅ **Analytics avanzado**: Predicciones con ML
- ✅ **Integración con bancos**: Solicitar préstamos
- ✅ **API pública**: Para integraciones externas
- ✅ **Mobile App nativa**: iOS y Android

---

## 17. CONCLUSIÓN Y RESUMEN

El **Módulo de Entrepreneurship Hub** es una plataforma completa y robusta para que jóvenes emprendedores (rol YOUTH) puedan:

### **Principales Capacidades:**

1. **Planificación de Negocio:**
   - Constructor guiado de Business Plans con 3 templates
   - Validación en tiempo real con scoring
   - Exportación a PDF/DOCX/HTML/JSON
   - Business Model Canvas visual
   - Triple Impact Analysis

2. **Herramientas Financieras:**
   - Calculadora financiera completa
   - Proyecciones de hasta 36 meses
   - Break-even analysis
   - ROI, NPV, IRR calculations
   - Gráficos visuales

3. **Networking:**
   - Red de emprendedores
   - Solicitudes de conexión (PENDING/ACCEPTED/DECLINED)
   - Feed social con posts, likes, comentarios
   - Búsqueda y filtros de usuarios

4. **Contenido Educativo:**
   - Noticias de emprendimiento
   - Recursos descargables (templates, guías, videos)
   - Categorización y tags
   - Sistema de featured resources

### **Arquitectura Técnica:**

- **Frontend:** Next.js 14+ con App Router, React 18+, TypeScript
- **Backend:** Next.js API Routes con NextAuth.js
- **Base de Datos:** PostgreSQL con Prisma ORM
- **Storage:** MinIO para archivos
- **State Management:** React Query (TanStack Query)
- **UI:** shadcn/ui + Tailwind CSS

### **Seguridad:**

- Autenticación requerida para todas las operaciones
- Validación de ownership en cada request
- Sanitización de inputs contra XSS
- Rate limiting (futuro)
- Encriptación de datos sensibles (futuro)

### **Datos Clave:**

- **40+ campos** en Business Plan completo
- **9 bloques** en Business Model Canvas
- **3 templates** predefinidos
- **6 tipos de recursos** (GUIDE, TEMPLATE, VIDEO, etc.)
- **5 tipos de posts** (TEXT, IMAGE, VIDEO, LINK, POLL)
- **3 estados de conexión** (PENDING, ACCEPTED, DECLINED)

### **Endpoints Principales:**

- `/api/business-plans` - CRUD de planes
- `/api/entrepreneurship/connections` - Networking
- `/api/entrepreneurship/posts` - Feed social
- `/api/entrepreneurship/news` - Noticias
- `/api/entrepreneurship/resources` - Recursos

---

Este análisis exhaustivo cubre todos los aspectos del módulo de Entrepreneurship para el rol YOUTH en la plataforma CEMSE. La información está actualizada al **30 de septiembre de 2025** según el código fuente analizado.

**Documento generado por:** Claude Code
**Fecha:** 30 de septiembre de 2025
**Versión del análisis:** 1.0.0
