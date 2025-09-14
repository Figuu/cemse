export interface BusinessPlanTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  difficulty: "beginner" | "intermediate" | "advanced";
  estimatedTime: number; // in minutes
  sections: BusinessPlanSection[];
  tips: string[];
  examples: string[];
}

export interface BusinessPlanSection {
  id: string;
  title: string;
  description: string;
  required: boolean;
  order: number;
  fields: BusinessPlanField[];
  tips: string[];
}

export interface TableData {
  headers: string[];
  rows: Record<string, string | number>[];
}

export interface ChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    backgroundColor?: string;
    borderColor?: string;
  }[];
}

export type BusinessPlanFieldDefaultValue = 
  | string 
  | number 
  | string[] 
  | TableData 
  | ChartData;

export interface BusinessPlanField {
  id: string;
  type: "text" | "textarea" | "number" | "currency" | "date" | "select" | "multiselect" | "table" | "chart";
  label: string;
  description?: string;
  required: boolean;
  placeholder?: string;
  options?: string[];
  validation?: {
    min?: number;
    max?: number;
    minLength?: number;
    maxLength?: number;
    pattern?: string;
  };
  defaultValue?: BusinessPlanFieldDefaultValue;
}

export const BUSINESS_PLAN_TEMPLATES: BusinessPlanTemplate[] = [
  {
    id: "lean-startup",
    name: "Lean Startup Plan",
    description: "Un plan de negocios ágil y enfocado en la validación de hipótesis",
    category: "Startup",
    difficulty: "beginner",
    estimatedTime: 30,
    sections: [
      {
        id: "executive-summary",
        title: "Resumen Ejecutivo",
        description: "Una visión general de tu startup en 1-2 párrafos",
        required: true,
        order: 1,
        fields: [
          {
            id: "problem",
            type: "textarea",
            label: "¿Qué problema resuelves?",
            description: "Describe claramente el problema que tu startup aborda",
            required: true,
            placeholder: "Ej: Los pequeños agricultores pierden el 30% de sus cultivos por falta de información sobre el clima...",
            validation: { minLength: 50, maxLength: 500 }
          },
          {
            id: "solution",
            type: "textarea",
            label: "¿Cuál es tu solución?",
            description: "Explica cómo tu producto o servicio resuelve el problema",
            required: true,
            placeholder: "Ej: Una app móvil que proporciona alertas meteorológicas precisas y consejos de cultivo...",
            validation: { minLength: 50, maxLength: 500 }
          },
          {
            id: "target-market",
            type: "textarea",
            label: "¿Quién es tu cliente objetivo?",
            description: "Define tu mercado objetivo específico",
            required: true,
            placeholder: "Ej: Pequeños agricultores en Bolivia con 1-10 hectáreas de cultivo...",
            validation: { minLength: 30, maxLength: 300 }
          },
          {
            id: "business-model",
            type: "textarea",
            label: "¿Cómo generas ingresos?",
            description: "Explica tu modelo de negocio y fuentes de ingresos",
            required: true,
            placeholder: "Ej: Suscripción mensual de $5 por agricultor, comisiones del 3% en ventas de insumos...",
            validation: { minLength: 30, maxLength: 300 }
          }
        ],
        tips: [
          "Mantén el resumen conciso pero completo",
          "Usa datos específicos cuando sea posible",
          "Evita jerga técnica innecesaria"
        ]
      },
      {
        id: "market-analysis",
        title: "Análisis de Mercado",
        description: "Investiga y analiza tu mercado objetivo",
        required: true,
        order: 2,
        fields: [
          {
            id: "market-size",
            type: "currency",
            label: "Tamaño del mercado (TAM)",
            description: "Tamaño total del mercado disponible",
            required: true,
            placeholder: "0"
          },
          {
            id: "target-market-size",
            type: "currency",
            label: "Mercado objetivo (SAM)",
            description: "Porción del mercado que puedes alcanzar",
            required: true,
            placeholder: "0"
          },
          {
            id: "serviceable-market",
            type: "currency",
            label: "Mercado alcanzable (SOM)",
            description: "Porción del mercado que puedes capturar",
            required: true,
            placeholder: "0"
          },
          {
            id: "competitors",
            type: "textarea",
            label: "Principales competidores",
            description: "Lista y analiza a tus competidores directos e indirectos",
            required: true,
            placeholder: "1. Competidor A - Ventaja: precio, Desventaja: funcionalidad limitada\n2. Competidor B - Ventaja: marca reconocida, Desventaja: no local",
            validation: { minLength: 100, maxLength: 1000 }
          },
          {
            id: "competitive-advantage",
            type: "textarea",
            label: "Ventaja competitiva",
            description: "¿Qué te hace único en el mercado?",
            required: true,
            placeholder: "Ej: Única app en español específica para el clima boliviano, con datos locales precisos...",
            validation: { minLength: 50, maxLength: 500 }
          }
        ],
        tips: [
          "Investiga datos reales del mercado",
          "Sé honesto sobre la competencia",
          "Enfócate en tu diferenciación única"
        ]
      },
      {
        id: "financial-projections",
        title: "Proyecciones Financieras",
        description: "Proyecciones de ingresos, gastos y rentabilidad",
        required: true,
        order: 3,
        fields: [
          {
            id: "revenue-projections",
            type: "table",
            label: "Proyecciones de Ingresos",
            description: "Proyección de ingresos por los próximos 3 años",
            required: true,
            defaultValue: {
              headers: ["Año", "Ingresos Mensuales", "Ingresos Anuales"],
              rows: [
                { year: 2024, monthly: 0, annual: 0 },
                { year: 2025, monthly: 0, annual: 0 },
                { year: 2026, monthly: 0, annual: 0 }
              ]
            }
          },
          {
            id: "expense-projections",
            type: "table",
            label: "Proyecciones de Gastos",
            description: "Proyección de gastos por los próximos 3 años",
            required: true,
            defaultValue: {
              headers: ["Año", "Gastos Operativos", "Gastos de Marketing", "Gastos Totales"],
              rows: [
                { year: 2024, operational: 0, marketing: 0, total: 0 },
                { year: 2025, operational: 0, marketing: 0, total: 0 },
                { year: 2026, operational: 0, marketing: 0, total: 0 }
              ]
            }
          },
          {
            id: "funding-needed",
            type: "currency",
            label: "Financiamiento necesario",
            description: "Cantidad total de financiamiento que necesitas",
            required: true,
            placeholder: "0"
          },
          {
            id: "funding-sources",
            type: "multiselect",
            label: "Fuentes de financiamiento",
            description: "Selecciona las fuentes de financiamiento que consideras",
            required: true,
            options: [
              "Ahorros personales",
              "Familia y amigos",
              "Inversionistas ángeles",
              "Venture capital",
              "Préstamos bancarios",
              "Subsidios gubernamentales",
              "Crowdfunding",
              "Aceleradoras/Incubadoras"
            ]
          },
          {
            id: "break-even",
            type: "number",
            label: "Punto de equilibrio (meses)",
            description: "En cuántos meses esperas alcanzar el punto de equilibrio",
            required: true,
            placeholder: "12",
            validation: { min: 1, max: 60 }
          }
        ],
        tips: [
          "Sé conservador en tus proyecciones",
          "Incluye todos los costos operativos",
          "Considera diferentes escenarios"
        ]
      }
    ],
    tips: [
      "Enfócate en la validación de tu idea",
      "Itera rápidamente basándote en feedback",
      "Mantén el plan simple y actualizable"
    ],
    examples: [
      "Ejemplo de problema: Los restaurantes pequeños desperdician comida porque no pueden predecir la demanda",
      "Ejemplo de solución: App que predice demanda basada en datos históricos y clima",
      "Ejemplo de modelo de negocio: Suscripción de $50/mes por restaurante"
    ]
  },
  {
    id: "traditional-business",
    name: "Plan de Negocios Tradicional",
    description: "Un plan de negocios completo y detallado para empresas establecidas",
    category: "Empresa",
    difficulty: "advanced",
    estimatedTime: 120,
    sections: [
      {
        id: "executive-summary",
        title: "Resumen Ejecutivo",
        description: "Resumen completo de la empresa y sus objetivos",
        required: true,
        order: 1,
        fields: [
          {
            id: "company-overview",
            type: "textarea",
            label: "Descripción de la empresa",
            description: "Descripción detallada de la empresa, su misión y visión",
            required: true,
            placeholder: "Descripción completa de la empresa...",
            validation: { minLength: 100, maxLength: 1000 }
          },
          {
            id: "products-services",
            type: "textarea",
            label: "Productos y servicios",
            description: "Descripción detallada de productos y servicios ofrecidos",
            required: true,
            placeholder: "Lista detallada de productos y servicios...",
            validation: { minLength: 100, maxLength: 1000 }
          },
          {
            id: "market-opportunity",
            type: "textarea",
            label: "Oportunidad de mercado",
            description: "Análisis de la oportunidad de mercado y potencial de crecimiento",
            required: true,
            placeholder: "Análisis detallado de la oportunidad...",
            validation: { minLength: 100, maxLength: 1000 }
          },
          {
            id: "financial-highlights",
            type: "textarea",
            label: "Resumen financiero",
            description: "Puntos clave de las proyecciones financieras",
            required: true,
            placeholder: "Resumen de proyecciones financieras...",
            validation: { minLength: 100, maxLength: 1000 }
          }
        ],
        tips: [
          "Incluye todos los aspectos clave del negocio",
          "Usa datos específicos y cuantificables",
          "Mantén un tono profesional"
        ]
      },
      {
        id: "company-description",
        title: "Descripción de la Empresa",
        description: "Información detallada sobre la empresa y su estructura",
        required: true,
        order: 2,
        fields: [
          {
            id: "legal-structure",
            type: "select",
            label: "Estructura legal",
            description: "Tipo de estructura legal de la empresa",
            required: true,
            options: [
              "Sociedad Anónima",
              "Sociedad de Responsabilidad Limitada",
              "Sociedad Colectiva",
              "Empresa Individual",
              "Cooperativa",
              "Otra"
            ]
          },
          {
            id: "management-team",
            type: "textarea",
            label: "Equipo directivo",
            description: "Descripción del equipo directivo y sus roles",
            required: true,
            placeholder: "Descripción del equipo directivo...",
            validation: { minLength: 100, maxLength: 1000 }
          },
          {
            id: "organizational-structure",
            type: "textarea",
            label: "Estructura organizacional",
            description: "Descripción de la estructura organizacional",
            required: true,
            placeholder: "Descripción de la estructura organizacional...",
            validation: { minLength: 100, maxLength: 1000 }
          }
        ],
        tips: [
          "Incluye información legal relevante",
          "Destaca la experiencia del equipo",
          "Explica la estructura de toma de decisiones"
        ]
      },
      {
        id: "market-analysis",
        title: "Análisis de Mercado",
        description: "Análisis detallado del mercado y la industria",
        required: true,
        order: 3,
        fields: [
          {
            id: "industry-overview",
            type: "textarea",
            label: "Visión general de la industria",
            description: "Descripción de la industria y su estado actual",
            required: true,
            placeholder: "Descripción de la industria...",
            validation: { minLength: 200, maxLength: 2000 }
          },
          {
            id: "target-market",
            type: "textarea",
            label: "Mercado objetivo",
            description: "Análisis detallado del mercado objetivo",
            required: true,
            placeholder: "Análisis del mercado objetivo...",
            validation: { minLength: 200, maxLength: 2000 }
          },
          {
            id: "competitive-analysis",
            type: "textarea",
            label: "Análisis competitivo",
            description: "Análisis detallado de la competencia",
            required: true,
            placeholder: "Análisis de la competencia...",
            validation: { minLength: 200, maxLength: 2000 }
          },
          {
            id: "market-trends",
            type: "textarea",
            label: "Tendencias del mercado",
            description: "Tendencias actuales y futuras del mercado",
            required: true,
            placeholder: "Tendencias del mercado...",
            validation: { minLength: 200, maxLength: 2000 }
          }
        ],
        tips: [
          "Incluye datos de investigación de mercado",
          "Analiza tanto competidores directos como indirectos",
          "Considera tendencias a largo plazo"
        ]
      },
      {
        id: "marketing-strategy",
        title: "Estrategia de Marketing",
        description: "Estrategia detallada de marketing y ventas",
        required: true,
        order: 4,
        fields: [
          {
            id: "marketing-objectives",
            type: "textarea",
            label: "Objetivos de marketing",
            description: "Objetivos específicos y medibles de marketing",
            required: true,
            placeholder: "Objetivos de marketing...",
            validation: { minLength: 100, maxLength: 1000 }
          },
          {
            id: "target-customers",
            type: "textarea",
            label: "Perfil del cliente objetivo",
            description: "Descripción detallada del cliente ideal",
            required: true,
            placeholder: "Perfil del cliente objetivo...",
            validation: { minLength: 100, maxLength: 1000 }
          },
          {
            id: "marketing-mix",
            type: "textarea",
            label: "Mix de marketing (4Ps)",
            description: "Producto, Precio, Plaza, Promoción",
            required: true,
            placeholder: "Mix de marketing...",
            validation: { minLength: 200, maxLength: 2000 }
          },
          {
            id: "sales-strategy",
            type: "textarea",
            label: "Estrategia de ventas",
            description: "Estrategia detallada de ventas y canales",
            required: true,
            placeholder: "Estrategia de ventas...",
            validation: { minLength: 200, maxLength: 2000 }
          }
        ],
        tips: [
          "Define objetivos SMART (específicos, medibles, alcanzables, relevantes, temporales)",
          "Incluye estrategias tanto online como offline",
          "Considera el presupuesto de marketing"
        ]
      },
      {
        id: "operations-plan",
        title: "Plan de Operaciones",
        description: "Plan detallado de operaciones y procesos",
        required: true,
        order: 5,
        fields: [
          {
            id: "operational-processes",
            type: "textarea",
            label: "Procesos operativos",
            description: "Descripción de los procesos operativos principales",
            required: true,
            placeholder: "Procesos operativos...",
            validation: { minLength: 200, maxLength: 2000 }
          },
          {
            id: "supply-chain",
            type: "textarea",
            label: "Cadena de suministro",
            description: "Descripción de la cadena de suministro y proveedores",
            required: true,
            placeholder: "Cadena de suministro...",
            validation: { minLength: 200, maxLength: 2000 }
          },
          {
            id: "technology-requirements",
            type: "textarea",
            label: "Requisitos tecnológicos",
            description: "Tecnología necesaria para las operaciones",
            required: true,
            placeholder: "Requisitos tecnológicos...",
            validation: { minLength: 100, maxLength: 1000 }
          },
          {
            id: "quality-control",
            type: "textarea",
            label: "Control de calidad",
            description: "Procedimientos de control de calidad",
            required: true,
            placeholder: "Control de calidad...",
            validation: { minLength: 100, maxLength: 1000 }
          }
        ],
        tips: [
          "Incluye diagramas de procesos cuando sea posible",
          "Considera la escalabilidad de las operaciones",
          "Define métricas de rendimiento"
        ]
      },
      {
        id: "financial-projections",
        title: "Proyecciones Financieras",
        description: "Proyecciones financieras detalladas",
        required: true,
        order: 6,
        fields: [
          {
            id: "revenue-projections",
            type: "table",
            label: "Proyecciones de Ingresos (5 años)",
            description: "Proyección detallada de ingresos",
            required: true,
            defaultValue: {
              headers: ["Año", "Q1", "Q2", "Q3", "Q4", "Total Anual"],
              rows: [
                { year: 2024, q1: 0, q2: 0, q3: 0, q4: 0, total: 0 },
                { year: 2025, q1: 0, q2: 0, q3: 0, q4: 0, total: 0 },
                { year: 2026, q1: 0, q2: 0, q3: 0, q4: 0, total: 0 },
                { year: 2027, q1: 0, q2: 0, q3: 0, q4: 0, total: 0 },
                { year: 2028, q1: 0, q2: 0, q3: 0, q4: 0, total: 0 }
              ]
            }
          },
          {
            id: "expense-projections",
            type: "table",
            label: "Proyecciones de Gastos (5 años)",
            description: "Proyección detallada de gastos",
            required: true,
            defaultValue: {
              headers: ["Año", "Gastos Operativos", "Gastos de Marketing", "Gastos Administrativos", "Total"],
              rows: [
                { year: 2024, operational: 0, marketing: 0, administrative: 0, total: 0 },
                { year: 2025, operational: 0, marketing: 0, administrative: 0, total: 0 },
                { year: 2026, operational: 0, marketing: 0, administrative: 0, total: 0 },
                { year: 2027, operational: 0, marketing: 0, administrative: 0, total: 0 },
                { year: 2028, operational: 0, marketing: 0, administrative: 0, total: 0 }
              ]
            }
          },
          {
            id: "cash-flow",
            type: "table",
            label: "Flujo de Caja (12 meses)",
            description: "Proyección de flujo de caja mensual",
            required: true,
            defaultValue: {
              headers: ["Mes", "Ingresos", "Gastos", "Flujo Neto", "Saldo Acumulado"],
              rows: Array.from({ length: 12 }, (_, i) => ({
                month: `Mes ${i + 1}`,
                income: 0,
                expenses: 0,
                netFlow: 0,
                balance: 0
              }))
            }
          },
          {
            id: "funding-requirements",
            type: "currency",
            label: "Requisitos de financiamiento",
            description: "Cantidad total de financiamiento necesaria",
            required: true,
            placeholder: "0"
          },
          {
            id: "use-of-funds",
            type: "textarea",
            label: "Uso de fondos",
            description: "Desglose detallado del uso de los fondos",
            required: true,
            placeholder: "Uso de fondos...",
            validation: { minLength: 100, maxLength: 1000 }
          }
        ],
        tips: [
          "Incluye múltiples escenarios (optimista, realista, pesimista)",
          "Considera la estacionalidad del negocio",
          "Incluye análisis de sensibilidad"
        ]
      },
      {
        id: "risk-analysis",
        title: "Análisis de Riesgos",
        description: "Identificación y análisis de riesgos",
        required: true,
        order: 7,
        fields: [
          {
            id: "risk-identification",
            type: "textarea",
            label: "Identificación de riesgos",
            description: "Lista de riesgos principales identificados",
            required: true,
            placeholder: "Lista de riesgos...",
            validation: { minLength: 200, maxLength: 2000 }
          },
          {
            id: "risk-assessment",
            type: "textarea",
            label: "Evaluación de riesgos",
            description: "Evaluación de probabilidad e impacto de cada riesgo",
            required: true,
            placeholder: "Evaluación de riesgos...",
            validation: { minLength: 200, maxLength: 2000 }
          },
          {
            id: "risk-mitigation",
            type: "textarea",
            label: "Estrategias de mitigación",
            description: "Estrategias para mitigar o gestionar los riesgos",
            required: true,
            placeholder: "Estrategias de mitigación...",
            validation: { minLength: 200, maxLength: 2000 }
          }
        ],
        tips: [
          "Considera riesgos internos y externos",
          "Incluye planes de contingencia",
          "Evalúa la probabilidad e impacto de cada riesgo"
        ]
      }
    ],
    tips: [
      "Incluye datos de investigación exhaustiva",
      "Sé detallado pero conciso",
      "Actualiza el plan regularmente"
    ],
    examples: [
      "Ejemplo de análisis de mercado: Incluye datos de tamaño de mercado, crecimiento, competencia",
      "Ejemplo de proyecciones: Incluye múltiples escenarios y justificaciones",
      "Ejemplo de análisis de riesgos: Identifica riesgos específicos con estrategias de mitigación"
    ]
  },
  {
    id: "social-enterprise",
    name: "Plan de Empresa Social",
    description: "Plan de negocios para empresas con impacto social",
    category: "Social",
    difficulty: "intermediate",
    estimatedTime: 90,
    sections: [
      {
        id: "social-mission",
        title: "Misión Social",
        description: "Definición clara de la misión social y el impacto",
        required: true,
        order: 1,
        fields: [
          {
            id: "social-problem",
            type: "textarea",
            label: "Problema social que abordas",
            description: "Descripción detallada del problema social",
            required: true,
            placeholder: "Descripción del problema social...",
            validation: { minLength: 100, maxLength: 1000 }
          },
          {
            id: "social-impact",
            type: "textarea",
            label: "Impacto social esperado",
            description: "Descripción del impacto social que esperas generar",
            required: true,
            placeholder: "Impacto social esperado...",
            validation: { minLength: 100, maxLength: 1000 }
          },
          {
            id: "beneficiaries",
            type: "textarea",
            label: "Beneficiarios directos e indirectos",
            description: "Descripción de quiénes se benefician de tu empresa",
            required: true,
            placeholder: "Beneficiarios...",
            validation: { minLength: 100, maxLength: 1000 }
          },
          {
            id: "impact-measurement",
            type: "textarea",
            label: "Medición del impacto",
            description: "Cómo planeas medir y evaluar tu impacto social",
            required: true,
            placeholder: "Medición del impacto...",
            validation: { minLength: 100, maxLength: 1000 }
          }
        ],
        tips: [
          "Define métricas específicas de impacto social",
          "Considera tanto impacto directo como indirecto",
          "Incluye indicadores cuantificables"
        ]
      },
      {
        id: "sustainability-model",
        title: "Modelo de Sostenibilidad",
        description: "Cómo la empresa será financieramente sostenible",
        required: true,
        order: 2,
        fields: [
          {
            id: "revenue-model",
            type: "textarea",
            label: "Modelo de ingresos",
            description: "Cómo generas ingresos para sostener el impacto social",
            required: true,
            placeholder: "Modelo de ingresos...",
            validation: { minLength: 100, maxLength: 1000 }
          },
          {
            id: "funding-strategy",
            type: "textarea",
            label: "Estrategia de financiamiento",
            description: "Estrategia para obtener financiamiento sostenible",
            required: true,
            placeholder: "Estrategia de financiamiento...",
            validation: { minLength: 100, maxLength: 1000 }
          },
          {
            id: "scaling-strategy",
            type: "textarea",
            label: "Estrategia de escalamiento",
            description: "Cómo planeas escalar tu impacto social",
            required: true,
            placeholder: "Estrategia de escalamiento...",
            validation: { minLength: 100, maxLength: 1000 }
          }
        ],
        tips: [
          "Balancea impacto social con sostenibilidad financiera",
          "Considera múltiples fuentes de ingresos",
          "Planifica el crecimiento del impacto"
        ]
      }
    ],
    tips: [
      "Enfócate en el impacto social medible",
      "Mantén el equilibrio entre misión social y sostenibilidad",
      "Incluye métricas de impacto específicas"
    ],
    examples: [
      "Ejemplo de problema social: Falta de acceso a educación de calidad en zonas rurales",
      "Ejemplo de impacto: 1000 niños con acceso a educación digital en 2 años",
      "Ejemplo de modelo de ingresos: Suscripciones + donaciones + subsidios gubernamentales"
    ]
  }
];

export function getTemplateById(id: string): BusinessPlanTemplate | undefined {
  return BUSINESS_PLAN_TEMPLATES.find(template => template.id === id);
}

export function getTemplatesByCategory(category: string): BusinessPlanTemplate[] {
  return BUSINESS_PLAN_TEMPLATES.filter(template => template.category === category);
}

export function getTemplatesByDifficulty(difficulty: string): BusinessPlanTemplate[] {
  return BUSINESS_PLAN_TEMPLATES.filter(template => template.difficulty === difficulty);
}

export function getAllTemplates(): BusinessPlanTemplate[] {
  return BUSINESS_PLAN_TEMPLATES;
}
