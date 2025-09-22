#!/usr/bin/env tsx

/**
 * Test script for business plan functions
 * This script tests the business plan CRUD operations with real data
 */

import { PrismaClient } from '@prisma/client';
import { BusinessPlanService } from '../src/lib/businessPlanService';

const prisma = new PrismaClient();

// Test data
const testBusinessPlanData = {
  userId: '', // Will be set after creating entrepreneurship
  title: 'Test Business Plan - ' + new Date().toISOString(),
  description: 'A comprehensive test business plan for validation',
  industry: 'Technology',
  stage: 'startup' as const,
  fundingGoal: 150000,
  currentFunding: 30000,
  teamSize: 8,
  marketSize: 2000000,
  targetMarket: 'Small and medium businesses',
  problemStatement: 'Many businesses struggle with inefficient software solutions that don\'t scale with their growth',
  solution: 'We provide scalable, cloud-based software solutions that grow with businesses',
  valueProposition: 'Our platform offers 3x better performance than competitors at half the cost',
  businessModel: 'SaaS subscription with tiered pricing',
  revenueStreams: ['monthly subscriptions', 'annual subscriptions', 'premium support', 'custom integrations'],
  costStructure: ['development team', 'cloud infrastructure', 'marketing', 'customer support'],
  keyMetrics: ['Monthly Recurring Revenue (MRR)', 'Customer Acquisition Cost (CAC)', 'Lifetime Value (LTV)', 'Churn Rate'],
  competitiveAdvantage: 'Proprietary AI algorithms that optimize business processes automatically',
  marketingStrategy: 'Content marketing, SEO, social media, and strategic partnerships',
  operationsPlan: 'Remote-first team with quarterly in-person meetings',
  tripleImpactAssessment: {
    problemSolved: 'Reduces business inefficiencies and environmental waste through optimized processes',
    beneficiaries: 'Small and medium business owners, their employees, and customers',
    resourcesUsed: 'Minimal environmental impact through cloud infrastructure and remote operations',
    communityInvolvement: 'Partnerships with local business associations and startup incubators',
    longTermImpact: 'Economic growth through improved business efficiency and job creation'
  },
  businessModelCanvas: {
    keyPartners: 'Cloud providers (AWS, Google Cloud), business consultants, integration partners',
    keyActivities: 'Software development, customer onboarding, support, marketing',
    valuePropositions: 'Scalable software, cost-effective pricing, excellent support',
    customerRelationships: 'Self-service platform with dedicated account managers for enterprise clients',
    customerSegments: 'Small businesses (1-50 employees), medium businesses (51-200 employees)',
    keyResources: 'Development team, cloud infrastructure, customer data, brand reputation',
    channels: 'Website, app stores, partner referrals, direct sales',
    costStructure: 'Development salaries, cloud hosting, marketing, customer support',
    revenueStreams: 'Subscription fees, premium support, custom development'
  },
  financialProjections: {
    startupCosts: 75000,
    monthlyRevenue: 15000,
    monthlyExpenses: 8000,
    breakEvenMonth: 8,
    revenueStreams: ['subscription', 'support', 'custom']
  },
  executiveSummary: 'Our company provides innovative SaaS solutions that help businesses scale efficiently while reducing costs and environmental impact.',
  businessDescription: 'We are a technology company focused on creating scalable business software solutions.',
  marketAnalysis: 'The SaaS market is growing at 15% annually with increasing demand for business automation tools.',
  competitiveAnalysis: 'We compete with established players like Salesforce and HubSpot, but offer better pricing and customization.',
  operationalPlan: 'We operate with a distributed team across multiple time zones to provide 24/7 support.',
  managementTeam: 'Experienced team with backgrounds in technology, business, and entrepreneurship.',
  riskAnalysis: 'Key risks include market competition, technology changes, and economic downturns affecting customer spending.',
  appendices: 'Detailed financial models, market research data, and technical specifications.',
  team: [
    {
      name: 'John Doe',
      role: 'CEO & Founder',
      experience: '10 years in tech startups',
      skills: ['Leadership', 'Strategy', 'Business Development'],
      equity: 40,
      isFounder: true
    },
    {
      name: 'Jane Smith',
      role: 'CTO',
      experience: '8 years in software development',
      skills: ['Full-stack Development', 'Architecture', 'Team Management'],
      equity: 25,
      isFounder: true
    }
  ],
  milestones: [
    {
      id: 'milestone-1',
      title: 'MVP Launch',
      description: 'Launch minimum viable product',
      targetDate: new Date('2024-03-01'),
      status: 'pending' as const,
      priority: 'high' as const,
      dependencies: []
    },
    {
      id: 'milestone-2',
      title: 'First 100 Customers',
      description: 'Acquire first 100 paying customers',
      targetDate: new Date('2024-06-01'),
      status: 'pending' as const,
      priority: 'high' as const,
      dependencies: ['milestone-1']
    }
  ],
  risks: [
    {
      id: 'risk-1',
      title: 'Market Competition',
      description: 'Large competitors entering the market',
      probability: 'medium' as const,
      impact: 'high' as const,
      mitigation: 'Focus on niche markets and superior customer service',
      owner: 'John Doe'
    }
  ]
};

async function createTestUser() {
  console.log('Creating test user...');
  
  // Check if test user already exists
  let user = await prisma.user.findUnique({
    where: { id: 'test-user-id' },
    include: { profile: true }
  });
  
  if (!user) {
    user = await prisma.user.create({
      data: {
        id: 'test-user-id',
        email: 'test@example.com',
        password: 'hashed-password', // This would normally be properly hashed
        role: 'YOUTH',
        firstName: 'Test',
        lastName: 'User',
        profile: {
          create: {
            firstName: 'Test',
            lastName: 'User',
            status: 'ACTIVE'
          }
        }
      },
      include: { profile: true }
    });
    console.log('Created test user:', user.id);
  } else {
    console.log('Using existing test user:', user.id);
    
    // Check if profile exists, create if not
    if (!user.profile) {
      await prisma.profile.create({
        data: {
          userId: user.id,
          firstName: 'Test',
          lastName: 'User',
          status: 'ACTIVE'
        }
      });
      console.log('Created profile for existing user');
    }
  }
  
  return user;
}

async function createTestEntrepreneurship() {
  console.log('Creating test entrepreneurship...');
  
  // First create a test user
  const user = await createTestUser();
  
  const entrepreneurship = await prisma.entrepreneurship.create({
    data: {
      name: 'Test Entrepreneurship - ' + new Date().toISOString(),
      description: 'Test entrepreneurship for business plan testing',
      category: 'Technology',
      businessStage: 'STARTUP',
      ownerId: user.id,
      municipality: 'Cochabamba',
      department: 'Cochabamba',
      isPublic: false
    }
  });
  
  console.log('Created entrepreneurship:', entrepreneurship.id);
  return entrepreneurship;
}

async function testCreateBusinessPlan(entrepreneurshipId: string) {
  console.log('\n=== Testing CREATE Business Plan ===');
  
  try {
    const businessPlanData = {
      ...testBusinessPlanData,
      userId: entrepreneurshipId
    };
    
    const businessPlan = await BusinessPlanService.createBusinessPlan(businessPlanData);
    console.log('✅ Business plan created successfully:', businessPlan.id);
    console.log('   Title:', businessPlan.title);
    console.log('   Completion:', businessPlan.completionPercentage + '%');
    
    return businessPlan;
  } catch (error) {
    console.error('❌ Failed to create business plan:', error instanceof Error ? error.message : 'Unknown error');
    throw error;
  }
}

async function testGetBusinessPlan(businessPlanId: string) {
  console.log('\n=== Testing GET Business Plan ===');
  
  try {
    const businessPlan = await BusinessPlanService.getBusinessPlan(businessPlanId);
    
    if (businessPlan) {
      console.log('✅ Business plan retrieved successfully:', businessPlan.id);
      console.log('   Title:', businessPlan.title);
      console.log('   Industry:', businessPlan.industry);
      console.log('   Stage:', businessPlan.stage);
      console.log('   Funding Goal:', businessPlan.fundingGoal);
      return businessPlan;
    } else {
      console.log('❌ Business plan not found');
      return null;
    }
  } catch (error) {
    console.error('❌ Failed to get business plan:', error instanceof Error ? error.message : 'Unknown error');
    throw error;
  }
}

async function testUpdateBusinessPlan(businessPlanId: string) {
  console.log('\n=== Testing UPDATE Business Plan ===');
  
  try {
    const updateData = {
      title: 'Updated Test Business Plan - ' + new Date().toISOString(),
      description: 'Updated description with more details',
      fundingGoal: 200000,
      currentFunding: 50000,
      teamSize: 12
    };
    
    const updatedPlan = await BusinessPlanService.updateBusinessPlan(businessPlanId, updateData);
    console.log('✅ Business plan updated successfully:', updatedPlan.id);
    console.log('   New Title:', updatedPlan.title);
    console.log('   New Funding Goal:', updatedPlan.fundingGoal);
    console.log('   New Team Size:', updatedPlan.teamSize);
    console.log('   Updated Completion:', updatedPlan.completionPercentage + '%');
    
    return updatedPlan;
  } catch (error) {
    console.error('❌ Failed to update business plan:', error instanceof Error ? error.message : 'Unknown error');
    throw error;
  }
}

async function testGetUserBusinessPlans(userId: string) {
  console.log('\n=== Testing GET User Business Plans ===');
  
  try {
    const result = await BusinessPlanService.getUserBusinessPlans(userId, {
      limit: 10,
      offset: 0,
      sortBy: 'updatedAt',
      sortOrder: 'desc'
    });
    
    console.log('✅ User business plans retrieved successfully');
    console.log('   Total plans:', result.total);
    console.log('   Plans returned:', result.businessPlans.length);
    console.log('   Has more:', result.hasMore);
    
    if (result.businessPlans.length > 0) {
      console.log('   Latest plan:', result.businessPlans[0].title);
    }
    
    return result;
  } catch (error) {
    console.error('❌ Failed to get user business plans:', error instanceof Error ? error.message : 'Unknown error');
    throw error;
  }
}

async function testDeleteBusinessPlan(businessPlanId: string) {
  console.log('\n=== Testing DELETE Business Plan ===');
  
  try {
    await BusinessPlanService.deleteBusinessPlan(businessPlanId);
    console.log('✅ Business plan deleted successfully:', businessPlanId);
    
    // Verify deletion
    const deletedPlan = await BusinessPlanService.getBusinessPlan(businessPlanId);
    if (deletedPlan === null) {
      console.log('✅ Deletion verified - business plan no longer exists');
    } else {
      console.log('❌ Deletion failed - business plan still exists');
    }
  } catch (error) {
    console.error('❌ Failed to delete business plan:', error instanceof Error ? error.message : 'Unknown error');
    throw error;
  }
}

async function cleanup(entrepreneurshipId: string) {
  console.log('\n=== Cleanup ===');
  
  try {
    // Delete the test entrepreneurship (this will cascade delete the business plan)
    await prisma.entrepreneurship.delete({
      where: { id: entrepreneurshipId }
    });
    console.log('✅ Test entrepreneurship deleted');
    
    // Delete the test user
    await prisma.user.delete({
      where: { id: 'test-user-id' }
    });
    console.log('✅ Test user deleted');
  } catch (error) {
    console.error('❌ Failed to cleanup:', error instanceof Error ? error.message : 'Unknown error');
  }
}

async function runTests() {
  console.log('🚀 Starting Business Plan Function Tests\n');
  
  let entrepreneurshipId: string | null = null;
  let businessPlanId: string | null = null;
  
  try {
    // Create test entrepreneurship
    const entrepreneurship = await createTestEntrepreneurship();
    entrepreneurshipId = entrepreneurship.id;
    
    // Test CREATE
    const businessPlan = await testCreateBusinessPlan(entrepreneurshipId);
    businessPlanId = businessPlan.id;
    
    // Test GET
    await testGetBusinessPlan(businessPlanId);
    
    // Test UPDATE
    await testUpdateBusinessPlan(businessPlanId);
    
    // Test GET User Business Plans
    await testGetUserBusinessPlans('test-user-id');
    
    // Test DELETE
    await testDeleteBusinessPlan(businessPlanId);
    
    console.log('\n🎉 All tests completed successfully!');
    
  } catch (error) {
    console.error('\n💥 Test suite failed:', error instanceof Error ? error.message : 'Unknown error');
    process.exit(1);
  } finally {
    // Cleanup
    if (entrepreneurshipId) {
      await cleanup(entrepreneurshipId);
    }
    
    await prisma.$disconnect();
  }
}

// Run the tests
if (require.main === module) {
  runTests().catch(console.error);
}

export {
  runTests,
  testCreateBusinessPlan,
  testGetBusinessPlan,
  testUpdateBusinessPlan,
  testGetUserBusinessPlans,
  testDeleteBusinessPlan
};
