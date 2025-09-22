import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { BusinessPlanService } from '@/lib/businessPlanService';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = parseInt(searchParams.get('offset') || '0');
    const status = searchParams.get('status');
    const sortBy = searchParams.get('sortBy') as 'createdAt' | 'updatedAt' | 'completionPercentage' || 'updatedAt';
    const sortOrder = searchParams.get('sortOrder') as 'asc' | 'desc' || 'desc';

    // Use the improved BusinessPlanService method
    const result = await BusinessPlanService.getUserBusinessPlans(session.user.id, {
      status: status || undefined,
      limit,
      offset,
      sortBy,
      sortOrder
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error fetching business plans:', error);
    return NextResponse.json(
      { error: 'Failed to fetch business plans' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    
    // Prepare business plan data with user ID
    const businessPlanData = {
      ...body,
      userId: session.user.id
    };

    // Use the improved BusinessPlanService method
    const businessPlan = await BusinessPlanService.createBusinessPlan(businessPlanData);

    return NextResponse.json({ businessPlan });
  } catch (error) {
    console.error('Error creating business plan:', error);
    
    // Handle specific error cases
    if (error instanceof Error) {
      if (error.message.includes('Business plan already exists')) {
        return NextResponse.json(
          { error: 'Business plan already exists for this user' },
          { status: 409 }
        );
      }
      if (error.message.includes('User not found')) {
        return NextResponse.json(
          { error: 'User not found' },
          { status: 404 }
        );
      }
    }

    return NextResponse.json(
      { error: 'Failed to create business plan' },
      { status: 500 }
    );
  }
}
