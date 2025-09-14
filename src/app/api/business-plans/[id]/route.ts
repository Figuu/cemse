import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { BusinessPlanService } from "@/lib/businessPlanService";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const businessPlan = await BusinessPlanService.getBusinessPlan(id);

    if (!businessPlan) {
      return NextResponse.json({ error: "Business plan not found" }, { status: 404 });
    }

    // Check if user owns the business plan
    if (businessPlan.userId !== session.user.id) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    return NextResponse.json({
      success: true,
      businessPlan
    });

  } catch (error) {
    console.error("Error fetching business plan:", error);
    return NextResponse.json(
      { error: "Failed to fetch business plan" },
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
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();

    // Check if user owns the business plan
    const existingPlan = await BusinessPlanService.getBusinessPlan(id);
    if (!existingPlan) {
      return NextResponse.json({ error: "Business plan not found" }, { status: 404 });
    }

    if (existingPlan.userId !== session.user.id) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    const businessPlan = await BusinessPlanService.updateBusinessPlan(id, body);

    return NextResponse.json({
      success: true,
      businessPlan
    });

  } catch (error) {
    console.error("Error updating business plan:", error);
    return NextResponse.json(
      { error: "Failed to update business plan" },
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
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    // Check if user owns the business plan
    const existingPlan = await BusinessPlanService.getBusinessPlan(id);
    if (!existingPlan) {
      return NextResponse.json({ error: "Business plan not found" }, { status: 404 });
    }

    if (existingPlan.userId !== session.user.id) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    await BusinessPlanService.deleteBusinessPlan(id);

    return NextResponse.json({
      success: true,
      message: "Business plan deleted successfully"
    });

  } catch (error) {
    console.error("Error deleting business plan:", error);
    return NextResponse.json(
      { error: "Failed to delete business plan" },
      { status: 500 }
    );
  }
}
