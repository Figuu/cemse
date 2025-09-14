import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';

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
  financialProjections: {
    year1: FinancialProjection;
    year2: FinancialProjection;
    year3: FinancialProjection;
  };
  team: TeamMember[];
  milestones: Milestone[];
  risks: Risk[];
  createdAt?: Date;
  updatedAt?: Date;
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
   * Create a new business plan
   */
  static async createBusinessPlan(data: BusinessPlanData): Promise<BusinessPlanData> {
    const businessPlan = await prisma.businessPlan.create({
      data: {
        entrepreneurshipId: data.userId, // Map userId to entrepreneurshipId
        content: data as unknown as Prisma.InputJsonValue, // Store all the business plan data as JSON
        status: 'draft' // Default status since isPublic doesn't exist on the interface
      }
    });

    return businessPlan as unknown as BusinessPlanData;
  }

  /**
   * Get business plan by ID
   */
  static async getBusinessPlan(id: string): Promise<BusinessPlanData | null> {
    const businessPlan = await prisma.businessPlan.findUnique({
      where: { id }
    });

    return businessPlan as unknown as BusinessPlanData | null;
  }

  /**
   * Get business plans by user ID
   */
  static async getUserBusinessPlans(userId: string): Promise<BusinessPlanData[]> {
    const businessPlans = await prisma.businessPlan.findMany({
      where: { entrepreneurshipId: userId },
      orderBy: { updatedAt: 'desc' }
    });

    return businessPlans as unknown as BusinessPlanData[];
  }

  /**
   * Update business plan
   */
  static async updateBusinessPlan(id: string, data: Partial<BusinessPlanData>): Promise<BusinessPlanData> {
    const businessPlan = await prisma.businessPlan.update({
      where: { id },
      data: {
        ...data,
        updatedAt: new Date()
      }
    });

    return businessPlan as unknown as BusinessPlanData;
  }

  /**
   * Delete business plan
   */
  static async deleteBusinessPlan(id: string): Promise<void> {
    await prisma.businessPlan.delete({
      where: { id }
    });
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
      'marketingStrategy', 'operationsPlan'
    ];

    const completedFields = requiredFields.filter(field => {
      const value = plan[field as keyof BusinessPlanData];
      if (Array.isArray(value)) {
        return value.length > 0;
      }
      return value && value.toString().trim().length > 0;
    });

    return Math.round((completedFields.length / requiredFields.length) * 100);
  }

  /**
   * Generate business plan summary
   */
  static generateSummary(plan: BusinessPlanData): string {
    const summary = `
# ${plan.title}

## Resumen Ejecutivo
${plan.description}

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

## Proyecciones Financieras
- Meta de financiamiento: $${plan.fundingGoal.toLocaleString()}
- Financiamiento actual: $${plan.currentFunding.toLocaleString()}
- Tamaño del mercado: $${plan.marketSize.toLocaleString()}

## Equipo
${plan.team.map(member => `- ${member.name}: ${member.role}`).join('\n')}

## Hitos Clave
${plan.milestones.map(milestone => `- ${milestone.title}: ${milestone.targetDate.toLocaleDateString()}`).join('\n')}
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
