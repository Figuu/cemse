import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { BusinessPlanService } from "@/lib/businessPlanService";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");
    const isPublic = searchParams.get("public") === "true";

    if (isPublic) {
      // Get public business plans for discovery
      const filters = {
        industry: searchParams.get("industry") || undefined,
        stage: searchParams.get("stage") || undefined,
        minFunding: searchParams.get("minFunding") ? parseInt(searchParams.get("minFunding")!) : undefined,
        maxFunding: searchParams.get("maxFunding") ? parseInt(searchParams.get("maxFunding")!) : undefined,
      };

      const limit = parseInt(searchParams.get("limit") || "20");
      const offset = parseInt(searchParams.get("offset") || "0");

      const businessPlans = await BusinessPlanService.getPublicBusinessPlans(filters, limit, offset);

      return NextResponse.json({
        success: true,
        businessPlans
      });
    } else {
      // Get user's business plans
      const targetUserId = userId || session.user.id;
      const businessPlans = await BusinessPlanService.getUserBusinessPlans(targetUserId);

      return NextResponse.json({
        success: true,
        businessPlans
      });
    }

  } catch (error) {
    console.error("Error fetching business plans:", error);
    return NextResponse.json(
      { error: "Failed to fetch business plans" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const businessPlanData = {
      ...body,
      userId: session.user.id
    };

    const businessPlan = await BusinessPlanService.createBusinessPlan(businessPlanData);

    return NextResponse.json({
      success: true,
      businessPlan
    });

  } catch (error) {
    console.error("Error creating business plan:", error);
    return NextResponse.json(
      { error: "Failed to create business plan" },
      { status: 500 }
    );
  }
}
