import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { BusinessPlanService } from '@/lib/businessPlanService';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    
    // Use the improved BusinessPlanService get method
    const businessPlan = await BusinessPlanService.getBusinessPlan(id);

    if (!businessPlan) {
      return NextResponse.json(
        { error: 'Business plan not found' },
        { status: 404 }
      );
    }

    // Check if user has access to this business plan
    // The userId in the business plan is the user ID
    if (businessPlan.userId !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    return NextResponse.json({ businessPlan });
  } catch (error) {
    console.error('Error fetching business plan:', error);
    return NextResponse.json(
      { error: 'Failed to fetch business plan' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const businessPlanData = body;

    // Check if business plan exists and user has access
    const existingPlan = await BusinessPlanService.getBusinessPlan(id);

    if (!existingPlan) {
      return NextResponse.json(
        { error: 'Business plan not found' },
        { status: 404 }
      );
    }

    if (existingPlan.userId !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Use the improved BusinessPlanService update method
    const businessPlan = await BusinessPlanService.updateBusinessPlan(id, businessPlanData);

    return NextResponse.json({ businessPlan });
  } catch (error) {
    console.error('Error updating business plan:', error);
    
    // Handle specific error cases
    if (error instanceof Error) {
      if (error.message.includes('Business plan not found')) {
        return NextResponse.json(
          { error: 'Business plan not found' },
          { status: 404 }
        );
      }
      if (error.message.includes('Invalid business plan ID')) {
        return NextResponse.json(
          { error: 'Invalid business plan ID' },
          { status: 400 }
        );
      }
    }

    return NextResponse.json(
      { error: 'Failed to update business plan' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    
    // Check if business plan exists and user has access
    const existingPlan = await BusinessPlanService.getBusinessPlan(id);

    if (!existingPlan) {
      return NextResponse.json(
        { error: 'Business plan not found' },
        { status: 404 }
      );
    }

    if (existingPlan.userId !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Use the BusinessPlanService delete method
    await BusinessPlanService.deleteBusinessPlan(id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting business plan:', error);
    
    // Handle specific error cases
    if (error instanceof Error) {
      if (error.message.includes('Business plan not found')) {
        return NextResponse.json(
          { error: 'Business plan not found' },
          { status: 404 }
        );
      }
      if (error.message.includes('Invalid business plan ID')) {
        return NextResponse.json(
          { error: 'Invalid business plan ID' },
          { status: 400 }
        );
      }
    }

    return NextResponse.json(
      { error: 'Failed to delete business plan' },
      { status: 500 }
    );
  }
}
