import { BusinessPlanService, BusinessPlanData } from '@/lib/businessPlanService';
import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';

// Mock Prisma
jest.mock('@/lib/prisma', () => ({
  prisma: {
    businessPlan: {
      create: jest.fn(),
      findUnique: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
    },
    entrepreneurship: {
      findUnique: jest.fn(),
      findFirst: jest.fn(),
    },
  },
}));

const mockPrisma = prisma as jest.Mocked<typeof prisma>;

describe('BusinessPlanService', () => {
  const mockUserId = 'user-123';
  const mockEntrepreneurshipId = 'entrepreneurship-123';
  const mockBusinessPlanId = 'business-plan-123';

  const mockBusinessPlanData: BusinessPlanData = {
    userId: mockEntrepreneurshipId,
    title: 'Test Business Plan',
    description: 'A test business plan for testing purposes',
    industry: 'Technology',
    stage: 'startup',
    fundingGoal: 100000,
    currentFunding: 25000,
    teamSize: 5,
    marketSize: 1000000,
    targetMarket: 'Small businesses',
    problemStatement: 'Businesses need better software',
    solution: 'We provide better software',
    valueProposition: 'Our software is better than competitors',
    businessModel: 'SaaS subscription',
    revenueStreams: ['subscription', 'consulting'],
    costStructure: ['development', 'marketing'],
    keyMetrics: ['MRR', 'CAC', 'LTV'],
    competitiveAdvantage: 'Better technology',
    marketingStrategy: 'Digital marketing',
    operationsPlan: 'Remote operations',
    tripleImpactAssessment: {
      problemSolved: 'Improves business efficiency',
      beneficiaries: 'Small business owners',
      resourcesUsed: 'Minimal environmental impact',
      communityInvolvement: 'Local partnerships',
      longTermImpact: 'Economic growth'
    },
    businessModelCanvas: {
      keyPartners: 'Technology partners',
      keyActivities: 'Software development',
      valuePropositions: 'Better software',
      customerRelationships: 'Direct support',
      customerSegments: 'Small businesses',
      keyResources: 'Development team',
      channels: 'Online platform',
      costStructure: 'Development costs',
      revenueStreams: 'Subscription fees'
    },
    financialProjections: {
      startupCosts: 50000,
      monthlyRevenue: 10000,
      monthlyExpenses: 5000,
      breakEvenMonth: 6,
      revenueStreams: ['subscription']
    },
    executiveSummary: 'Executive summary',
    businessDescription: 'Business description',
    marketAnalysis: 'Market analysis',
    competitiveAnalysis: 'Competitive analysis',
    operationalPlan: 'Operational plan',
    managementTeam: 'Management team',
    riskAnalysis: 'Risk analysis',
    appendices: 'Appendices',
    team: [],
    milestones: [],
    risks: []
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createBusinessPlan', () => {
    it('should create a business plan successfully', async () => {
      const mockCreatedPlan = {
        id: mockBusinessPlanId,
        entrepreneurshipId: mockEntrepreneurshipId,
        content: mockBusinessPlanData,
        status: 'draft',
        tripleImpactAssessment: mockBusinessPlanData.tripleImpactAssessment,
        businessModelCanvas: mockBusinessPlanData.businessModelCanvas,
        financialProjections: mockBusinessPlanData.financialProjections,
        completionPercentage: 85,
        createdAt: new Date(),
        updatedAt: new Date(),
        entrepreneurship: {
          id: mockEntrepreneurshipId,
          ownerId: mockUserId
        }
      };

      mockPrisma.entrepreneurship.findUnique.mockResolvedValue({
        id: mockEntrepreneurshipId,
        ownerId: mockUserId
      } as any);

      mockPrisma.businessPlan.create.mockResolvedValue(mockCreatedPlan as any);

      const result = await BusinessPlanService.createBusinessPlan(mockBusinessPlanData);

      expect(mockPrisma.entrepreneurship.findUnique).toHaveBeenCalledWith({
        where: { id: mockEntrepreneurshipId }
      });

      expect(mockPrisma.businessPlan.create).toHaveBeenCalledWith({
        data: {
          entrepreneurshipId: mockEntrepreneurshipId,
          content: expect.any(Object),
          status: 'draft',
          tripleImpactAssessment: mockBusinessPlanData.tripleImpactAssessment,
          businessModelCanvas: mockBusinessPlanData.businessModelCanvas,
          financialProjections: mockBusinessPlanData.financialProjections,
          completionPercentage: expect.any(Number)
        },
        include: {
          entrepreneurship: {
            select: {
              id: true,
              ownerId: true
            }
          }
        }
      });

      expect(result).toEqual(expect.objectContaining({
        id: mockBusinessPlanId,
        userId: mockUserId,
        title: mockBusinessPlanData.title
      }));
    });

    it('should throw error if entrepreneurship not found', async () => {
      mockPrisma.entrepreneurship.findUnique.mockResolvedValue(null);

      await expect(BusinessPlanService.createBusinessPlan(mockBusinessPlanData))
        .rejects.toThrow('Entrepreneurship profile not found');
    });

    it('should throw error for invalid data', async () => {
      const invalidData = { ...mockBusinessPlanData, title: '' };

      await expect(BusinessPlanService.createBusinessPlan(invalidData))
        .rejects.toThrow('Title is required');
    });

    it('should handle Prisma unique constraint error', async () => {
      const prismaError = new Prisma.PrismaClientKnownRequestError(
        'Unique constraint failed',
        {
          code: 'P2002',
          clientVersion: '4.0.0'
        }
      );

      mockPrisma.entrepreneurship.findUnique.mockResolvedValue({
        id: mockEntrepreneurshipId,
        ownerId: mockUserId
      } as any);

      mockPrisma.businessPlan.create.mockRejectedValue(prismaError);

      await expect(BusinessPlanService.createBusinessPlan(mockBusinessPlanData))
        .rejects.toThrow('Business plan already exists for this entrepreneurship');
    });
  });

  describe('getBusinessPlan', () => {
    it('should get a business plan successfully', async () => {
      const mockPlan = {
        id: mockBusinessPlanId,
        entrepreneurshipId: mockEntrepreneurshipId,
        content: mockBusinessPlanData,
        status: 'draft',
        tripleImpactAssessment: mockBusinessPlanData.tripleImpactAssessment,
        businessModelCanvas: mockBusinessPlanData.businessModelCanvas,
        financialProjections: mockBusinessPlanData.financialProjections,
        completionPercentage: 85,
        createdAt: new Date(),
        updatedAt: new Date(),
        entrepreneurship: {
          id: mockEntrepreneurshipId,
          ownerId: mockUserId
        }
      };

      mockPrisma.businessPlan.findUnique.mockResolvedValue(mockPlan as any);

      const result = await BusinessPlanService.getBusinessPlan(mockBusinessPlanId);

      expect(mockPrisma.businessPlan.findUnique).toHaveBeenCalledWith({
        where: { id: mockBusinessPlanId },
        include: {
          entrepreneurship: {
            select: {
              id: true,
              ownerId: true
            }
          }
        }
      });

      expect(result).toEqual(expect.objectContaining({
        id: mockBusinessPlanId,
        userId: mockUserId,
        title: mockBusinessPlanData.title
      }));
    });

    it('should return null if business plan not found', async () => {
      mockPrisma.businessPlan.findUnique.mockResolvedValue(null);

      const result = await BusinessPlanService.getBusinessPlan(mockBusinessPlanId);

      expect(result).toBeNull();
    });

    it('should throw error for invalid ID', async () => {
      await expect(BusinessPlanService.getBusinessPlan(''))
        .rejects.toThrow('Invalid business plan ID');
    });
  });

  describe('getUserBusinessPlans', () => {
    it('should get user business plans with pagination', async () => {
      const mockPlans = [
        {
          id: mockBusinessPlanId,
          entrepreneurshipId: mockEntrepreneurshipId,
          content: mockBusinessPlanData,
          status: 'draft',
          completionPercentage: 85,
          createdAt: new Date(),
          updatedAt: new Date(),
          entrepreneurship: {
            id: mockEntrepreneurshipId,
            ownerId: mockUserId
          }
        }
      ];

      mockPrisma.businessPlan.count.mockResolvedValue(1);
      mockPrisma.businessPlan.findMany.mockResolvedValue(mockPlans as any);

      const result = await BusinessPlanService.getUserBusinessPlans(mockUserId, {
        limit: 10,
        offset: 0,
        status: 'draft'
      });

      expect(mockPrisma.businessPlan.count).toHaveBeenCalledWith({
        where: {
          entrepreneurship: {
            ownerId: mockUserId
          },
          status: 'draft'
        }
      });

      expect(mockPrisma.businessPlan.findMany).toHaveBeenCalledWith({
        where: {
          entrepreneurship: {
            ownerId: mockUserId
          },
          status: 'draft'
        },
        orderBy: { updatedAt: 'desc' },
        take: 10,
        skip: 0,
        include: {
          entrepreneurship: {
            select: {
              id: true,
              ownerId: true
            }
          }
        }
      });

      expect(result).toEqual({
        businessPlans: expect.arrayContaining([
          expect.objectContaining({
            id: mockBusinessPlanId,
            userId: mockUserId
          })
        ]),
        total: 1,
        hasMore: false
      });
    });
  });

  describe('updateBusinessPlan', () => {
    it('should update a business plan successfully', async () => {
      const existingPlan = {
        id: mockBusinessPlanId,
        entrepreneurshipId: mockEntrepreneurshipId,
        content: mockBusinessPlanData,
        status: 'draft',
        createdAt: new Date(),
        updatedAt: new Date(),
        entrepreneurship: {
          id: mockEntrepreneurshipId,
          ownerId: mockUserId
        }
      };

      const updatedPlan = {
        ...existingPlan,
        content: { ...mockBusinessPlanData, title: 'Updated Title' },
        updatedAt: new Date()
      };

      mockPrisma.businessPlan.findUnique.mockResolvedValue(existingPlan as any);
      mockPrisma.businessPlan.update.mockResolvedValue(updatedPlan as any);

      const updateData = { title: 'Updated Title' };
      const result = await BusinessPlanService.updateBusinessPlan(mockBusinessPlanId, updateData);

      expect(mockPrisma.businessPlan.findUnique).toHaveBeenCalledWith({
        where: { id: mockBusinessPlanId },
        include: {
          entrepreneurship: {
            select: {
              id: true,
              ownerId: true
            }
          }
        }
      });

      expect(mockPrisma.businessPlan.update).toHaveBeenCalledWith({
        where: { id: mockBusinessPlanId },
        data: expect.objectContaining({
          content: expect.any(Object),
          completionPercentage: expect.any(Number),
          updatedAt: expect.any(Date)
        }),
        include: {
          entrepreneurship: {
            select: {
              id: true,
              ownerId: true
            }
          }
        }
      });

      expect(result).toEqual(expect.objectContaining({
        id: mockBusinessPlanId,
        userId: mockUserId
      }));
    });

    it('should throw error if business plan not found', async () => {
      mockPrisma.businessPlan.findUnique.mockResolvedValue(null);

      await expect(BusinessPlanService.updateBusinessPlan(mockBusinessPlanId, { title: 'New Title' }))
        .rejects.toThrow('Business plan not found');
    });
  });

  describe('deleteBusinessPlan', () => {
    it('should delete a business plan successfully', async () => {
      mockPrisma.businessPlan.delete.mockResolvedValue({} as any);

      await BusinessPlanService.deleteBusinessPlan(mockBusinessPlanId);

      expect(mockPrisma.businessPlan.delete).toHaveBeenCalledWith({
        where: { id: mockBusinessPlanId }
      });
    });

    it('should throw error for invalid ID', async () => {
      await expect(BusinessPlanService.deleteBusinessPlan(''))
        .rejects.toThrow('Invalid business plan ID');
    });

    it('should handle Prisma not found error', async () => {
      const prismaError = new Prisma.PrismaClientKnownRequestError(
        'Record not found',
        {
          code: 'P2025',
          clientVersion: '4.0.0'
        }
      );

      mockPrisma.businessPlan.delete.mockRejectedValue(prismaError);

      await expect(BusinessPlanService.deleteBusinessPlan(mockBusinessPlanId))
        .rejects.toThrow('Business plan not found');
    });
  });

  describe('calculateCompletionPercentage', () => {
    it('should calculate completion percentage correctly', () => {
      const completion = BusinessPlanService.calculateCompletionPercentage(mockBusinessPlanData);
      expect(completion).toBeGreaterThan(0);
      expect(completion).toBeLessThanOrEqual(100);
    });

    it('should return low percentage for mostly empty business plan', () => {
      const emptyPlan = {
        userId: mockEntrepreneurshipId,
        title: '',
        description: '',
        industry: '',
        stage: 'idea' as const,
        fundingGoal: 0,
        currentFunding: 0,
        teamSize: 0,
        marketSize: 0,
        targetMarket: '',
        problemStatement: '',
        solution: '',
        valueProposition: '',
        businessModel: '',
        revenueStreams: [],
        costStructure: [],
        keyMetrics: [],
        competitiveAdvantage: '',
        marketingStrategy: '',
        operationsPlan: '',
        executiveSummary: '',
        businessDescription: '',
        marketAnalysis: '',
        competitiveAnalysis: '',
        operationalPlan: '',
        managementTeam: '',
        riskAnalysis: '',
        appendices: '',
        team: [],
        milestones: [],
        risks: []
      };

      const completion = BusinessPlanService.calculateCompletionPercentage(emptyPlan);
      // The completion percentage should be very low (close to 0) for an empty plan
      expect(completion).toBeLessThan(10);
    });
  });

  describe('generateSummary', () => {
    it('should generate a business plan summary', () => {
      const summary = BusinessPlanService.generateSummary(mockBusinessPlanData);
      
      expect(summary).toContain(mockBusinessPlanData.title);
      expect(summary).toContain(mockBusinessPlanData.problemStatement);
      expect(summary).toContain(mockBusinessPlanData.solution);
      expect(summary).toContain(mockBusinessPlanData.valueProposition);
    });
  });
});
