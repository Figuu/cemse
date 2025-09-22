import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { BusinessPlanService } from '@/lib/businessPlanService';
import { prisma } from '@/lib/prisma';

// Mock dependencies
jest.mock('next-auth', () => ({
  getServerSession: jest.fn(),
}));

jest.mock('@/lib/businessPlanService', () => ({
  BusinessPlanService: {
    getUserBusinessPlans: jest.fn(),
    createBusinessPlan: jest.fn(),
    getBusinessPlan: jest.fn(),
    updateBusinessPlan: jest.fn(),
    deleteBusinessPlan: jest.fn(),
  },
}));

jest.mock('@/lib/prisma', () => ({
  prisma: {
    entrepreneurship: {
      findFirst: jest.fn(),
    },
  },
}));

const mockGetServerSession = getServerSession as jest.MockedFunction<typeof getServerSession>;
const mockBusinessPlanService = BusinessPlanService as jest.Mocked<typeof BusinessPlanService>;
const mockPrisma = prisma as jest.Mocked<typeof prisma>;

// Import the route handlers after mocking
const { GET: getBusinessPlans, POST: createBusinessPlan } = require('@/app/api/business-plans/route');
const { GET: getBusinessPlan, PUT: updateBusinessPlan, DELETE: deleteBusinessPlan } = require('@/app/api/business-plans/[id]/route');

describe('/api/business-plans', () => {
  const mockUserId = 'user-123';
  const mockEntrepreneurshipId = 'entrepreneurship-123';
  const mockBusinessPlanId = 'business-plan-123';

  const mockSession = {
    user: {
      id: mockUserId,
      email: 'test@example.com',
    },
  };

  const mockBusinessPlanData = {
    title: 'Test Business Plan',
    description: 'A test business plan',
    industry: 'Technology',
    stage: 'startup',
    fundingGoal: 100000,
    currentFunding: 25000,
    teamSize: 5,
    marketSize: 1000000,
    targetMarket: 'Small businesses',
    problemStatement: 'Businesses need better software',
    solution: 'We provide better software',
    valueProposition: 'Our software is better',
    businessModel: 'SaaS subscription',
    revenueStreams: ['subscription'],
    costStructure: ['development'],
    keyMetrics: ['MRR'],
    competitiveAdvantage: 'Better technology',
    marketingStrategy: 'Digital marketing',
    operationsPlan: 'Remote operations',
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

  describe('GET /api/business-plans', () => {
    it('should return business plans for authenticated user', async () => {
      mockGetServerSession.mockResolvedValue(mockSession);
      mockBusinessPlanService.getUserBusinessPlans.mockResolvedValue({
        businessPlans: [
          {
            id: mockBusinessPlanId,
            userId: mockUserId,
            ...mockBusinessPlanData
          }
        ],
        total: 1,
        hasMore: false
      });

      const request = new NextRequest('http://localhost:3000/api/business-plans?limit=10&offset=0');
      const response = await getBusinessPlans(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.businessPlans).toHaveLength(1);
      expect(data.total).toBe(1);
      expect(data.hasMore).toBe(false);
      expect(mockBusinessPlanService.getUserBusinessPlans).toHaveBeenCalledWith(mockUserId, {
        status: undefined,
        limit: 10,
        offset: 0,
        sortBy: 'updatedAt',
        sortOrder: 'desc'
      });
    });

    it('should return 401 for unauthenticated user', async () => {
      mockGetServerSession.mockResolvedValue(null);

      const request = new NextRequest('http://localhost:3000/api/business-plans');
      const response = await getBusinessPlans(request);

      expect(response.status).toBe(401);
      const data = await response.json();
      expect(data.error).toBe('Unauthorized');
    });

    it('should handle service errors', async () => {
      mockGetServerSession.mockResolvedValue(mockSession);
      mockBusinessPlanService.getUserBusinessPlans.mockRejectedValue(new Error('Service error'));

      const request = new NextRequest('http://localhost:3000/api/business-plans');
      const response = await getBusinessPlans(request);

      expect(response.status).toBe(500);
      const data = await response.json();
      expect(data.error).toBe('Failed to fetch business plans');
    });
  });

  describe('POST /api/business-plans', () => {
    it('should create a business plan successfully', async () => {
      mockGetServerSession.mockResolvedValue(mockSession);
      mockPrisma.entrepreneurship.findFirst.mockResolvedValue({
        id: mockEntrepreneurshipId,
        ownerId: mockUserId
      } as any);
      mockBusinessPlanService.createBusinessPlan.mockResolvedValue({
        id: mockBusinessPlanId,
        userId: mockUserId,
        ...mockBusinessPlanData
      });

      const request = new NextRequest('http://localhost:3000/api/business-plans', {
        method: 'POST',
        body: JSON.stringify(mockBusinessPlanData),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const response = await createBusinessPlan(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.businessPlan.id).toBe(mockBusinessPlanId);
      expect(mockBusinessPlanService.createBusinessPlan).toHaveBeenCalledWith({
        ...mockBusinessPlanData,
        userId: mockEntrepreneurshipId
      });
    });

    it('should return 404 if entrepreneurship not found', async () => {
      mockGetServerSession.mockResolvedValue(mockSession);
      mockPrisma.entrepreneurship.findFirst.mockResolvedValue(null);

      const request = new NextRequest('http://localhost:3000/api/business-plans', {
        method: 'POST',
        body: JSON.stringify(mockBusinessPlanData),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const response = await createBusinessPlan(request);

      expect(response.status).toBe(404);
      const data = await response.json();
      expect(data.error).toBe('Entrepreneurship profile not found');
    });

    it('should return 409 for duplicate business plan', async () => {
      mockGetServerSession.mockResolvedValue(mockSession);
      mockPrisma.entrepreneurship.findFirst.mockResolvedValue({
        id: mockEntrepreneurshipId,
        ownerId: mockUserId
      } as any);
      mockBusinessPlanService.createBusinessPlan.mockRejectedValue(
        new Error('Business plan already exists for this entrepreneurship')
      );

      const request = new NextRequest('http://localhost:3000/api/business-plans', {
        method: 'POST',
        body: JSON.stringify(mockBusinessPlanData),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const response = await createBusinessPlan(request);

      expect(response.status).toBe(409);
      const data = await response.json();
      expect(data.error).toBe('Business plan already exists for this entrepreneurship');
    });
  });
});

describe('/api/business-plans/[id]', () => {
  const mockUserId = 'user-123';
  const mockBusinessPlanId = 'business-plan-123';

  const mockSession = {
    user: {
      id: mockUserId,
      email: 'test@example.com',
    },
  };

  const mockBusinessPlan = {
    id: mockBusinessPlanId,
    userId: mockUserId,
    title: 'Test Business Plan',
    description: 'A test business plan',
    industry: 'Technology',
    stage: 'startup',
    fundingGoal: 100000,
    currentFunding: 25000,
    teamSize: 5,
    marketSize: 1000000,
    targetMarket: 'Small businesses',
    problemStatement: 'Businesses need better software',
    solution: 'We provide better software',
    valueProposition: 'Our software is better',
    businessModel: 'SaaS subscription',
    revenueStreams: ['subscription'],
    costStructure: ['development'],
    keyMetrics: ['MRR'],
    competitiveAdvantage: 'Better technology',
    marketingStrategy: 'Digital marketing',
    operationsPlan: 'Remote operations',
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

  describe('GET /api/business-plans/[id]', () => {
    it('should return a business plan for authorized user', async () => {
      mockGetServerSession.mockResolvedValue(mockSession);
      mockBusinessPlanService.getBusinessPlan.mockResolvedValue(mockBusinessPlan);

      const request = new NextRequest(`http://localhost:3000/api/business-plans/${mockBusinessPlanId}`);
      const response = await getBusinessPlan(request, { params: Promise.resolve({ id: mockBusinessPlanId }) });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.businessPlan.id).toBe(mockBusinessPlanId);
      expect(mockBusinessPlanService.getBusinessPlan).toHaveBeenCalledWith(mockBusinessPlanId);
    });

    it('should return 404 if business plan not found', async () => {
      mockGetServerSession.mockResolvedValue(mockSession);
      mockBusinessPlanService.getBusinessPlan.mockResolvedValue(null);

      const request = new NextRequest(`http://localhost:3000/api/business-plans/${mockBusinessPlanId}`);
      const response = await getBusinessPlan(request, { params: Promise.resolve({ id: mockBusinessPlanId }) });

      expect(response.status).toBe(404);
      const data = await response.json();
      expect(data.error).toBe('Business plan not found');
    });

    it('should return 403 for unauthorized user', async () => {
      mockGetServerSession.mockResolvedValue(mockSession);
      mockBusinessPlanService.getBusinessPlan.mockResolvedValue({
        ...mockBusinessPlan,
        userId: 'different-user-id'
      });

      const request = new NextRequest(`http://localhost:3000/api/business-plans/${mockBusinessPlanId}`);
      const response = await getBusinessPlan(request, { params: Promise.resolve({ id: mockBusinessPlanId }) });

      expect(response.status).toBe(403);
      const data = await response.json();
      expect(data.error).toBe('Forbidden');
    });
  });

  describe('PUT /api/business-plans/[id]', () => {
    it('should update a business plan successfully', async () => {
      const updateData = { title: 'Updated Title' };
      const updatedPlan = { ...mockBusinessPlan, ...updateData };

      mockGetServerSession.mockResolvedValue(mockSession);
      mockBusinessPlanService.getBusinessPlan.mockResolvedValue(mockBusinessPlan);
      mockBusinessPlanService.updateBusinessPlan.mockResolvedValue(updatedPlan);

      const request = new NextRequest(`http://localhost:3000/api/business-plans/${mockBusinessPlanId}`, {
        method: 'PUT',
        body: JSON.stringify(updateData),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const response = await updateBusinessPlan(request, { params: Promise.resolve({ id: mockBusinessPlanId }) });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.businessPlan.title).toBe('Updated Title');
      expect(mockBusinessPlanService.updateBusinessPlan).toHaveBeenCalledWith(mockBusinessPlanId, updateData);
    });

    it('should return 404 if business plan not found', async () => {
      mockGetServerSession.mockResolvedValue(mockSession);
      mockBusinessPlanService.getBusinessPlan.mockResolvedValue(null);

      const request = new NextRequest(`http://localhost:3000/api/business-plans/${mockBusinessPlanId}`, {
        method: 'PUT',
        body: JSON.stringify({ title: 'Updated Title' }),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const response = await updateBusinessPlan(request, { params: Promise.resolve({ id: mockBusinessPlanId }) });

      expect(response.status).toBe(404);
      const data = await response.json();
      expect(data.error).toBe('Business plan not found');
    });
  });

  describe('DELETE /api/business-plans/[id]', () => {
    it('should delete a business plan successfully', async () => {
      mockGetServerSession.mockResolvedValue(mockSession);
      mockBusinessPlanService.getBusinessPlan.mockResolvedValue(mockBusinessPlan);
      mockBusinessPlanService.deleteBusinessPlan.mockResolvedValue();

      const request = new NextRequest(`http://localhost:3000/api/business-plans/${mockBusinessPlanId}`, {
        method: 'DELETE',
      });

      const response = await deleteBusinessPlan(request, { params: Promise.resolve({ id: mockBusinessPlanId }) });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(mockBusinessPlanService.deleteBusinessPlan).toHaveBeenCalledWith(mockBusinessPlanId);
    });

    it('should return 404 if business plan not found', async () => {
      mockGetServerSession.mockResolvedValue(mockSession);
      mockBusinessPlanService.getBusinessPlan.mockResolvedValue(null);

      const request = new NextRequest(`http://localhost:3000/api/business-plans/${mockBusinessPlanId}`, {
        method: 'DELETE',
      });

      const response = await deleteBusinessPlan(request, { params: Promise.resolve({ id: mockBusinessPlanId }) });

      expect(response.status).toBe(404);
      const data = await response.json();
      expect(data.error).toBe('Business plan not found');
    });
  });
});
