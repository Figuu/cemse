import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';
// Updated for new schema

export interface BusinessPlanData {
  id?: string;
  userId: string;
  title: string;
  description: string;
  industry: string;
  stage: 'idea' | 'startup' | 'growth' | 'mature';
  fundingGoal: number;
  currentFunding: number;
  teamSize: number;
  marketSize: number;
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
    // Keep the yearly projections for compatibility
    year1?: FinancialProjection;
    year2?: FinancialProjection;
    year3?: FinancialProjection;
  };
  
  // Additional fields from simulator
  executiveSummary: string;
  businessDescription: string;
  marketAnalysis: string;
  competitiveAnalysis: string;
  operationalPlan: string;
  managementTeam: string;
  riskAnalysis: string;
  appendices: string;
  
  // Legacy fields for backward compatibility
  team: TeamMember[];
  milestones: Milestone[];
  risks: Risk[];
  createdAt?: Date;
  updatedAt?: Date;
  completionPercentage?: number;
}

export interface FinancialProjection {
  revenue: number;
  expenses: number;
  profit: number;
  cashFlow: number;
  customers: number;
  growthRate: number;
}

export interface TeamMember {
  name: string;
  role: string;
  experience: string;
  skills: string[];
  equity: number;
  isFounder: boolean;
}

export interface Milestone {
  id: string;
  title: string;
  description: string;
  targetDate: Date;
  status: 'pending' | 'in_progress' | 'completed' | 'delayed';
  priority: 'low' | 'medium' | 'high';
  dependencies: string[];
}

export interface Risk {
  id: string;
  title: string;
  description: string;
  probability: 'low' | 'medium' | 'high';
  impact: 'low' | 'medium' | 'high';
  mitigation: string;
  owner: string;
}

export class BusinessPlanService {
  /**
   * Validate business plan data for creation
   */
  private static validateBusinessPlanData(data: BusinessPlanData): void {
    if (!data.userId || typeof data.userId !== 'string') {
      throw new Error('User ID is required');
    }
    if (!data.title || typeof data.title !== 'string' || data.title.trim().length === 0) {
      throw new Error('Title is required');
    }
    if (!data.description || typeof data.description !== 'string' || data.description.trim().length === 0) {
      throw new Error('Description is required');
    }
    if (!data.industry || typeof data.industry !== 'string' || data.industry.trim().length === 0) {
      throw new Error('Industry is required');
    }
    if (!data.stage || !['idea', 'startup', 'growth', 'mature'].includes(data.stage)) {
      throw new Error('Valid stage is required (idea, startup, growth, mature)');
    }
    if (typeof data.fundingGoal !== 'number' || data.fundingGoal < 0) {
      throw new Error('Valid funding goal is required');
    }
  }

  /**
   * Validate business plan update data
   */
  private static validateBusinessPlanUpdateData(data: Partial<BusinessPlanData>): void {
    if (data.title !== undefined && (typeof data.title !== 'string' || data.title.trim().length === 0)) {
      throw new Error('Title cannot be empty');
    }
    if (data.description !== undefined && (typeof data.description !== 'string' || data.description.trim().length === 0)) {
      throw new Error('Description cannot be empty');
    }
    if (data.industry !== undefined && (typeof data.industry !== 'string' || data.industry.trim().length === 0)) {
      throw new Error('Industry cannot be empty');
    }
    if (data.stage !== undefined && !['idea', 'startup', 'growth', 'mature'].includes(data.stage)) {
      throw new Error('Invalid stage (must be: idea, startup, growth, mature)');
    }
    if (data.fundingGoal !== undefined && (typeof data.fundingGoal !== 'number' || data.fundingGoal < 0)) {
      throw new Error('Funding goal must be a positive number');
    }
    if (data.currentFunding !== undefined && (typeof data.currentFunding !== 'number' || data.currentFunding < 0)) {
      throw new Error('Current funding must be a positive number');
    }
    if (data.teamSize !== undefined && (typeof data.teamSize !== 'number' || data.teamSize < 0)) {
      throw new Error('Team size must be a positive number');
    }
    if (data.marketSize !== undefined && (typeof data.marketSize !== 'number' || data.marketSize < 0)) {
      throw new Error('Market size must be a positive number');
    }
  }

  /**
   * Sanitize business plan data to prevent XSS and ensure data integrity
   */
  private static sanitizeBusinessPlanData(data: BusinessPlanData): BusinessPlanData {
    const sanitizeString = (str: string): string => {
      if (typeof str !== 'string') return '';
      return str.trim().replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
    };

    const sanitizeArray = (arr: string[]): string[] => {
      if (!Array.isArray(arr)) return [];
      return arr.map(item => sanitizeString(item)).filter(item => item.length > 0);
    };

    return {
      ...data,
      title: sanitizeString(data.title),
      description: sanitizeString(data.description),
      industry: sanitizeString(data.industry),
      targetMarket: sanitizeString(data.targetMarket),
      problemStatement: sanitizeString(data.problemStatement),
      solution: sanitizeString(data.solution),
      valueProposition: sanitizeString(data.valueProposition),
      businessModel: sanitizeString(data.businessModel),
      competitiveAdvantage: sanitizeString(data.competitiveAdvantage),
      marketingStrategy: sanitizeString(data.marketingStrategy),
      operationsPlan: sanitizeString(data.operationsPlan),
      executiveSummary: sanitizeString(data.executiveSummary),
      businessDescription: sanitizeString(data.businessDescription),
      marketAnalysis: sanitizeString(data.marketAnalysis),
      competitiveAnalysis: sanitizeString(data.competitiveAnalysis),
      operationalPlan: sanitizeString(data.operationalPlan),
      managementTeam: sanitizeString(data.managementTeam),
      riskAnalysis: sanitizeString(data.riskAnalysis),
      appendices: sanitizeString(data.appendices),
      revenueStreams: sanitizeArray(data.revenueStreams),
      costStructure: sanitizeArray(data.costStructure),
      keyMetrics: sanitizeArray(data.keyMetrics),
      // Sanitize nested objects
      tripleImpactAssessment: data.tripleImpactAssessment ? {
        problemSolved: sanitizeString(data.tripleImpactAssessment.problemSolved),
        beneficiaries: sanitizeString(data.tripleImpactAssessment.beneficiaries),
        resourcesUsed: sanitizeString(data.tripleImpactAssessment.resourcesUsed),
        communityInvolvement: sanitizeString(data.tripleImpactAssessment.communityInvolvement),
        longTermImpact: sanitizeString(data.tripleImpactAssessment.longTermImpact)
      } : undefined,
      businessModelCanvas: data.businessModelCanvas ? {
        keyPartners: sanitizeString(data.businessModelCanvas.keyPartners),
        keyActivities: sanitizeString(data.businessModelCanvas.keyActivities),
        valuePropositions: sanitizeString(data.businessModelCanvas.valuePropositions),
        customerRelationships: sanitizeString(data.businessModelCanvas.customerRelationships),
        customerSegments: sanitizeString(data.businessModelCanvas.customerSegments),
        keyResources: sanitizeString(data.businessModelCanvas.keyResources),
        channels: sanitizeString(data.businessModelCanvas.channels),
        costStructure: sanitizeString(data.businessModelCanvas.costStructure),
        revenueStreams: sanitizeString(data.businessModelCanvas.revenueStreams)
      } : undefined
    };
  }

  /**
   * Transform database result to BusinessPlanData format
   */
  private static transformBusinessPlanData(dbPlan: any): BusinessPlanData {
    const content = dbPlan.content as BusinessPlanData;
    
    return {
      ...content,
      id: dbPlan.id,
      userId: dbPlan.userId,
      createdAt: dbPlan.createdAt,
      updatedAt: dbPlan.updatedAt,
      // Ensure structured data is properly included
      tripleImpactAssessment: dbPlan.tripleImpactAssessment || content.tripleImpactAssessment,
      businessModelCanvas: dbPlan.businessModelCanvas || content.businessModelCanvas,
      financialProjections: dbPlan.financialProjections || content.financialProjections,
      // Include completion percentage
      completionPercentage: dbPlan.completionPercentage
    };
  }

  /**
   * Create a new business plan with validation and proper data handling
   */
  static async createBusinessPlan(data: BusinessPlanData): Promise<BusinessPlanData> {
    try {
      // Validate required fields
      this.validateBusinessPlanData(data);

      // Sanitize data before processing
      const sanitizedData = this.sanitizeBusinessPlanData(data);

      // Calculate completion percentage
      const completionPercentage = this.calculateCompletionPercentage(sanitizedData);

      // Check if user exists
      const user = await prisma.user.findUnique({
        where: { id: data.userId }
      });

      if (!user) {
        throw new Error('User not found');
      }

      // Create business plan with proper data structure
      const businessPlan = await prisma.businessPlan.create({
        data: {
          userId: data.userId,
          content: sanitizedData as unknown as Prisma.InputJsonValue,
          status: 'draft',
          tripleImpactAssessment: sanitizedData.tripleImpactAssessment as unknown as Prisma.InputJsonValue || null,
          businessModelCanvas: sanitizedData.businessModelCanvas as unknown as Prisma.InputJsonValue || null,
          financialProjections: sanitizedData.financialProjections as unknown as Prisma.InputJsonValue || null,
          completionPercentage
        } as any,
        // include: {
        //   user: {
        //     select: {
        //       id: true,
        //       email: true,
        //       firstName: true,
        //       lastName: true
        //     }
        //   }
        // }
      });

      return this.transformBusinessPlanData(businessPlan);
    } catch (error) {
      console.error('Error creating business plan:', error);
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new Error('Business plan already exists for this user');
        }
      }
      throw new Error(`Failed to create business plan: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get business plan by ID with proper error handling and data transformation
   */
  static async getBusinessPlan(id: string): Promise<BusinessPlanData | null> {
    try {
      if (!id || typeof id !== 'string') {
        throw new Error('Invalid business plan ID');
      }

      const businessPlan = await prisma.businessPlan.findUnique({
        where: { id },
        // include: {
        //   user: {
        //     select: {
        //       id: true,
        //       email: true,
        //       firstName: true,
        //       lastName: true
        //     }
        //   }
        // }
      });

      if (!businessPlan) {
        return null;
      }

      return this.transformBusinessPlanData(businessPlan);
    } catch (error) {
      console.error('Error fetching business plan:', error);
      throw new Error(`Failed to fetch business plan: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get business plans by user ID with pagination and filtering
   */
  static async getUserBusinessPlans(
    userId: string, 
    options: {
      status?: string;
      limit?: number;
      offset?: number;
      sortBy?: 'createdAt' | 'updatedAt' | 'completionPercentage';
      sortOrder?: 'asc' | 'desc';
    } = {}
  ): Promise<{ businessPlans: BusinessPlanData[]; total: number; hasMore: boolean }> {
    try {
      if (!userId || typeof userId !== 'string') {
        throw new Error('Invalid user ID');
      }

      const {
        status,
        limit = 10,
        offset = 0,
        sortBy = 'updatedAt',
        sortOrder = 'desc'
      } = options;

      // Build where clause - find business plans by user ID
      const whereClause: Prisma.BusinessPlanWhereInput = {
        userId: userId
      } as any;

      if (status) {
        whereClause.status = status;
      }

      // Get total count
      const total = await prisma.businessPlan.count({
        where: whereClause
      });

      // Get business plans with pagination
      const businessPlans = await prisma.businessPlan.findMany({
        where: whereClause,
        orderBy: { [sortBy]: sortOrder },
        take: limit,
        skip: offset,
        // include: {
        //   user: {
        //     select: {
        //       id: true,
        //       email: true,
        //       firstName: true,
        //       lastName: true
        //     }
        //   }
        // }
      });

      const transformedPlans = businessPlans.map(plan => this.transformBusinessPlanData(plan));

      return {
        businessPlans: transformedPlans,
        total,
        hasMore: offset + limit < total
      };
    } catch (error) {
      console.error('Error fetching user business plans:', error);
      throw new Error(`Failed to fetch user business plans: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Update business plan with validation and completion percentage recalculation
   */
  static async updateBusinessPlan(id: string, data: Partial<BusinessPlanData>): Promise<BusinessPlanData> {
    try {
      if (!id || typeof id !== 'string') {
        throw new Error('Invalid business plan ID');
      }

      // Check if business plan exists and get ownership info
      const existingPlan = await prisma.businessPlan.findUnique({
        where: { id },
        // include: {
        //   user: {
        //     select: {
        //       id: true,
        //       email: true,
        //       firstName: true,
        //       lastName: true
        //     }
        //   }
        // }
      });

      if (!existingPlan) {
        throw new Error('Business plan not found');
      }

      // Validate update data
      this.validateBusinessPlanUpdateData(data);

      // Merge with existing data
      const existingContent = existingPlan.content as unknown as BusinessPlanData;
      const mergedData = { ...existingContent, ...data };

      // Sanitize the merged data
      const sanitizedData = this.sanitizeBusinessPlanData(mergedData);

      // Calculate new completion percentage
      const completionPercentage = this.calculateCompletionPercentage(sanitizedData);

      // Prepare structured data updates
      const structuredUpdates: any = {
        completionPercentage
      };

      if (data.tripleImpactAssessment) {
        structuredUpdates.tripleImpactAssessment = data.tripleImpactAssessment as unknown as Prisma.InputJsonValue;
      }
      if (data.businessModelCanvas) {
        structuredUpdates.businessModelCanvas = data.businessModelCanvas as unknown as Prisma.InputJsonValue;
      }
      if (data.financialProjections) {
        structuredUpdates.financialProjections = data.financialProjections as unknown as Prisma.InputJsonValue;
      }

      // Update business plan
      const updatedPlan = await prisma.businessPlan.update({
        where: { id },
        data: {
          content: sanitizedData as unknown as Prisma.InputJsonValue,
          ...structuredUpdates,
          updatedAt: new Date()
        },
        // include: {
        //   user: {
        //     select: {
        //       id: true,
        //       email: true,
        //       firstName: true,
        //       lastName: true
        //     }
        //   }
        // }
      });

      return this.transformBusinessPlanData(updatedPlan);
    } catch (error) {
      console.error('Error updating business plan:', error);
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new Error('Business plan not found');
        }
      }
      throw new Error(`Failed to update business plan: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Delete business plan
   */
  static async deleteBusinessPlan(id: string): Promise<void> {
    try {
      if (!id || typeof id !== 'string') {
        throw new Error('Invalid business plan ID');
      }

      await prisma.businessPlan.delete({
        where: { id }
      });
    } catch (error) {
      console.error('Error deleting business plan:', error);
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new Error('Business plan not found');
        }
      }
      throw new Error(`Failed to delete business plan: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get public business plans for discovery
   */
  static async getPublicBusinessPlans(
    _filters: {
      industry?: string;
      stage?: string;
      minFunding?: number;
      maxFunding?: number;
    } = {},
    limit = 20,
    offset = 0
  ): Promise<BusinessPlanData[]> {
    const whereClause: Prisma.BusinessPlanWhereInput = {
      status: 'published' // Use status instead of isPublic
    };

    // Note: The BusinessPlan model doesn't have industry, stage, or fundingGoal fields
    // These filters would need to be applied to the content JSON or related Entrepreneurship model
    // For now, we'll just filter by status

    const businessPlans = await prisma.businessPlan.findMany({
      where: whereClause,
      orderBy: { updatedAt: 'desc' },
      take: limit,
      skip: offset
    });

    return businessPlans as unknown as BusinessPlanData[];
  }

  /**
   * Calculate business plan completion percentage
   */
  static calculateCompletionPercentage(plan: BusinessPlanData): number {
    const requiredFields = [
      'title', 'description', 'industry', 'stage', 'targetMarket',
      'problemStatement', 'solution', 'valueProposition', 'businessModel',
      'revenueStreams', 'costStructure', 'keyMetrics', 'competitiveAdvantage',
      'marketingStrategy', 'operationsPlan', 'executiveSummary', 'marketAnalysis',
      'competitiveAnalysis', 'operationalPlan', 'managementTeam', 'riskAnalysis'
    ];

    const tripleImpactFields = [
      'problemSolved', 'beneficiaries', 'resourcesUsed', 'communityInvolvement', 'longTermImpact'
    ];

    const businessModelCanvasFields = [
      'keyPartners', 'keyActivities', 'valuePropositions', 'customerRelationships',
      'customerSegments', 'keyResources', 'channels', 'costStructure', 'revenueStreams'
    ];

    const financialFields = [
      'startupCosts', 'monthlyRevenue', 'monthlyExpenses', 'breakEvenMonth'
    ];

    let completedFields = 0;
    let totalFields = requiredFields.length + tripleImpactFields.length + businessModelCanvasFields.length + financialFields.length;

    // Check basic required fields
    requiredFields.forEach(field => {
      const value = plan[field as keyof BusinessPlanData];
      if (Array.isArray(value)) {
        if (value.length > 0) completedFields++;
      } else if (value && value.toString().trim().length > 0) {
        completedFields++;
      }
    });

    // Check triple impact assessment
    if (plan.tripleImpactAssessment) {
      tripleImpactFields.forEach(field => {
        const value = plan.tripleImpactAssessment[field as keyof typeof plan.tripleImpactAssessment];
        if (value && value.trim().length > 0) completedFields++;
      });
    }

    // Check business model canvas
    if (plan.businessModelCanvas) {
      businessModelCanvasFields.forEach(field => {
        const value = plan.businessModelCanvas[field as keyof typeof plan.businessModelCanvas];
        if (value && value.trim().length > 0) completedFields++;
      });
    }

    // Check financial projections
    if (plan.financialProjections) {
      financialFields.forEach(field => {
        const value = plan.financialProjections[field as keyof typeof plan.financialProjections];
        if (typeof value === 'number' && value > 0) completedFields++;
      });
    }

    return Math.round((completedFields / totalFields) * 100);
  }

  /**
   * Generate business plan summary
   */
  static generateSummary(plan: BusinessPlanData): string {
    const summary = `
# ${plan.title}

## Resumen Ejecutivo
${plan.executiveSummary || plan.description}

## Problema y Solución
**Problema:** ${plan.problemStatement}

**Solución:** ${plan.solution}

## Propuesta de Valor
${plan.valueProposition}

## Modelo de Negocio
${plan.businessModel}

## Mercado Objetivo
${plan.targetMarket}

## Ventaja Competitiva
${plan.competitiveAdvantage}

## Triple Impacto
**Problema Resuelto:** ${plan.tripleImpactAssessment?.problemSolved || 'No especificado'}

**Beneficiarios:** ${plan.tripleImpactAssessment?.beneficiaries || 'No especificado'}

**Recursos Utilizados:** ${plan.tripleImpactAssessment?.resourcesUsed || 'No especificado'}

**Involucramiento Comunitario:** ${plan.tripleImpactAssessment?.communityInvolvement || 'No especificado'}

**Impacto a Largo Plazo:** ${plan.tripleImpactAssessment?.longTermImpact || 'No especificado'}

## Proyecciones Financieras
- Meta de financiamiento: $${plan.fundingGoal.toLocaleString()}
- Financiamiento actual: $${plan.currentFunding.toLocaleString()}
- Tamaño del mercado: $${plan.marketSize.toLocaleString()}
- Costos de inicio: $${plan.financialProjections?.startupCosts?.toLocaleString() || '0'}
- Ingresos mensuales proyectados: $${plan.financialProjections?.monthlyRevenue?.toLocaleString() || '0'}
- Gastos mensuales: $${plan.financialProjections?.monthlyExpenses?.toLocaleString() || '0'}
- Mes de equilibrio: ${plan.financialProjections?.breakEvenMonth || 'No calculado'}

## Equipo
${plan.team?.map(member => `- ${member.name}: ${member.role}`).join('\n') || 'No especificado'}

## Hitos Clave
${plan.milestones?.map(milestone => `- ${milestone.title}: ${milestone.targetDate.toLocaleDateString()}`).join('\n') || 'No especificado'}

## Análisis de Riesgos
${plan.riskAnalysis || 'No especificado'}
    `.trim();

    return summary;
  }

  /**
   * Export business plan to PDF
   */
  static async exportToPDF(plan: BusinessPlanData): Promise<Buffer> {
    // This would integrate with a PDF generation library
    // For now, return a placeholder
    const summary = this.generateSummary(plan);
    return Buffer.from(summary, 'utf-8');
  }
}
